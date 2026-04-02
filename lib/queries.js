// lib/queries.js
// All database queries — replaces firestore.js and firestore-admin.js
const crypto = require('crypto');

function getDb() {
  return require('./db');
}

function genId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

// Helper: convert SQLite row to match old Firestore format (createdAt as object)
function formatRow(row) {
  if (!row) return null;
  const { active, anonymous, read, ...rest } = row;
  return {
    ...rest,
    // Convert integer booleans back to real booleans
    ...(active !== undefined ? { active: Boolean(active) } : {}),
    ...(anonymous !== undefined ? { anonymous: Boolean(anonymous) } : {}),
    ...(read !== undefined ? { read: Boolean(read) } : {}),
    // Parse JSON arrays
    ...(row.roles ? { roles: JSON.parse(row.roles) } : {}),
    ...(row.availability ? { availability: JSON.parse(row.availability) } : {}),
    ...(row.skills ? { skills: JSON.parse(row.skills) } : {}),
    // createdAt as object with seconds for compatibility with existing UI code
    createdAt: row.createdAt
      ? { seconds: Math.floor(new Date(row.createdAt).getTime() / 1000) }
      : null,
  };
}

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────

function authenticateAdmin(username, password) {
  const db = getDb();
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ? AND password = ?').get(username, password);
  if (!user) return null;
  const { password: _, ...safe } = user;
  return { ...safe, createdAt: user.createdAt ? { seconds: Math.floor(new Date(user.createdAt).getTime() / 1000) } : null };
}

function getAdminUsers() {
  const db = getDb();
  return db.prepare('SELECT id, username, role, displayName, email, createdAt FROM admin_users ORDER BY createdAt ASC').all()
    .map(u => ({ ...u, createdAt: u.createdAt ? { seconds: Math.floor(new Date(u.createdAt).getTime() / 1000) } : null }));
}

function createAdminUser(data) {
  const db = getDb();
  const id = genId();
  // Check for duplicate username
  const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(data.username);
  if (existing) throw new Error('Username already exists');
  db.prepare(`
    INSERT INTO admin_users (id, username, password, role, displayName, email, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.username, data.password, data.role || 'admin', data.displayName || data.username, data.email || '', now());
  return { id };
}

function deleteAdminUser(id) {
  const db = getDb();
  // Prevent deleting the last super_admin
  const user = db.prepare('SELECT role FROM admin_users WHERE id = ?').get(id);
  if (user?.role === 'super_admin') {
    const superCount = db.prepare("SELECT COUNT(*) as count FROM admin_users WHERE role = 'super_admin'").get();
    if (superCount.count <= 1) throw new Error('Cannot delete the last Super Admin');
  }
  db.prepare('DELETE FROM admin_users WHERE id = ?').run(id);
}

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────

function getCampaigns() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM campaigns ORDER BY createdAt DESC').all();
  return rows.map(formatRow);
}

function getCampaign(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
  return formatRow(row);
}

function createCampaign(data) {
  const db = getDb();
  const id = genId();
  db.prepare(`
    INSERT INTO campaigns (id, title, description, goalAmount, raisedAmount, donorCount, category, endDate, imageUrl, active, createdAt)
    VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?, 1, ?)
  `).run(
    id,
    data.title || '',
    data.description || '',
    Number(data.goalAmount) || 0,
    data.category || 'general',
    data.endDate || '',
    data.imageUrl || '',
    now(),
  );
  return { id };
}

function updateCampaign(id, data) {
  const db = getDb();
  const sets = [];
  const vals = [];

  for (const [key, val] of Object.entries(data)) {
    if (key === 'id' || key === 'createdAt') continue;
    if (key === 'active') {
      sets.push('active = ?');
      vals.push(val ? 1 : 0);
    } else {
      sets.push(`${key} = ?`);
      vals.push(val);
    }
  }

  if (sets.length === 0) return;
  vals.push(id);
  db.prepare(`UPDATE campaigns SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
}

function deleteCampaign(id) {
  const db = getDb();
  db.prepare('DELETE FROM campaigns WHERE id = ?').run(id);
}

// ─── DONATIONS ────────────────────────────────────────────────────────────────

function submitDonation(donationData) {
  const db = getDb();
  const id = genId();
  const { campaignId, amount, ...rest } = donationData;
  const numAmount = Number(amount);

  // Status defaults to 'pending' — admin must approve
  const status = rest.status || 'pending';

  const insertDonation = db.prepare(`
    INSERT INTO donations (id, donorName, email, phone, amount, campaignId, category, donationType, paymentMethod, message, anonymous, status, approvedBy, approvedAt, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Only update campaign totals if status is approved
  const updateCamp = db.prepare(`
    UPDATE campaigns SET raisedAmount = raisedAmount + ?, donorCount = donorCount + 1 WHERE id = ?
  `);

  const transaction = db.transaction(() => {
    insertDonation.run(
      id,
      rest.donorName || 'Anonymous',
      rest.email || '',
      rest.phone || '',
      numAmount,
      campaignId || '',
      rest.category || 'general',
      rest.donationType || 'one-time',
      rest.paymentMethod || 'card',
      rest.message || '',
      rest.anonymous ? 1 : 0,
      status,
      rest.approvedBy || '',
      rest.approvedAt || '',
      now(),
    );

    // If auto-approved (admin manual entry), update campaign immediately
    if (status === 'approved' && campaignId) {
      updateCamp.run(numAmount, campaignId);
    }
  });

  transaction();
  return { id, status };
}

function updateDonationStatus(id, status, approvedBy) {
  const db = getDb();

  const donation = db.prepare('SELECT * FROM donations WHERE id = ?').get(id);
  if (!donation) throw new Error('Donation not found');

  const transaction = db.transaction(() => {
    db.prepare('UPDATE donations SET status = ?, approvedBy = ?, approvedAt = ? WHERE id = ?')
      .run(status, approvedBy || '', now(), id);

    // When approving, add to campaign totals
    if (status === 'approved' && donation.status !== 'approved' && donation.campaignId) {
      db.prepare('UPDATE campaigns SET raisedAmount = raisedAmount + ?, donorCount = donorCount + 1 WHERE id = ?')
        .run(donation.amount, donation.campaignId);
    }

    // When rejecting a previously approved donation, subtract from campaign
    if (status === 'rejected' && donation.status === 'approved' && donation.campaignId) {
      db.prepare('UPDATE campaigns SET raisedAmount = MAX(0, raisedAmount - ?), donorCount = MAX(0, donorCount - 1) WHERE id = ?')
        .run(donation.amount, donation.campaignId);
    }
  });

  transaction();
}

function getDonations(limit = null) {
  const db = getDb();
  const sql = limit
    ? 'SELECT * FROM donations ORDER BY createdAt DESC LIMIT ?'
    : 'SELECT * FROM donations ORDER BY createdAt DESC';
  const rows = limit ? db.prepare(sql).all(limit) : db.prepare(sql).all();
  return rows.map(formatRow);
}

function getDonation(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM donations WHERE id = ?').get(id);
  return formatRow(row);
}

function getDonationsByCampaign(campaignId) {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM donations WHERE campaignId = ? ORDER BY createdAt DESC'
  ).all(campaignId);
  return rows.map(formatRow);
}

function getDonationsByStatus(status) {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM donations WHERE status = ? ORDER BY createdAt DESC'
  ).all(status);
  return rows.map(formatRow);
}

// ─── DATA PURGE ───────────────────────────────────────────────────────────────

function purgeAllData() {
  const db = getDb();
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM donations').run();
    db.prepare('DELETE FROM campaigns').run();
    db.prepare('DELETE FROM contacts').run();
    db.prepare('DELETE FROM volunteers').run();
    db.prepare('DELETE FROM newsletter').run();
    // Do NOT delete admin_users
  });
  transaction();
}

// ─── STATS ────────────────────────────────────────────────────────────────────

function getStats() {
  const db = getDb();
  const donation = db.prepare(`
    SELECT COUNT(*) as totalDonations, COALESCE(SUM(amount), 0) as totalRaised FROM donations WHERE status = 'approved'
  `).get();
  const campaigns = db.prepare(`SELECT COUNT(*) as total FROM campaigns`).get();
  const active = db.prepare(`SELECT COUNT(*) as total FROM campaigns WHERE active = 1`).get();

  return {
    totalDonations: donation.totalDonations,
    totalRaised: donation.totalRaised,
    activeCampaigns: active.total,
    totalCampaigns: campaigns.total,
  };
}

// ─── VOLUNTEERS ──────────────────────────────────────────────────────────────

function addVolunteer(data) {
  const db = getDb();
  const id = genId();
  db.prepare(`
    INSERT INTO volunteers (id, name, email, phone, roles, availability, skills, message, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    id,
    data.name || '',
    data.email || '',
    data.phone || '',
    JSON.stringify(data.roles || []),
    JSON.stringify(data.availability || []),
    JSON.stringify(data.skills || []),
    data.message || '',
    now(),
  );
  return { id };
}

function getVolunteers() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM volunteers ORDER BY createdAt DESC').all();
  return rows.map(formatRow);
}

function updateVolunteerStatus(id, status) {
  const db = getDb();
  db.prepare('UPDATE volunteers SET status = ? WHERE id = ?').run(status, id);
}

function deleteVolunteer(id) {
  const db = getDb();
  db.prepare('DELETE FROM volunteers WHERE id = ?').run(id);
}

// ─── NEWSLETTER ──────────────────────────────────────────────────────────────

function addNewsletter(email) {
  const db = getDb();
  const id = genId();
  db.prepare(`
    INSERT INTO newsletter (id, email, active, createdAt) VALUES (?, ?, 1, ?)
  `).run(id, email.trim().toLowerCase(), now());
  return { id };
}

function getNewsletterSubscribers() {
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM newsletter WHERE active = 1 ORDER BY createdAt DESC'
  ).all();
  return rows.map(formatRow);
}

function unsubscribeNewsletter(id) {
  const db = getDb();
  db.prepare('UPDATE newsletter SET active = 0 WHERE id = ?').run(id);
}

function unsubscribeNewsletterByEmail(email) {
  const db = getDb();
  const result = db.prepare(
    'UPDATE newsletter SET active = 0 WHERE email = ? AND active = 1'
  ).run(email.trim().toLowerCase());
  return result.changes > 0;
}

// ─── CONTACTS ─────────────────────────────────────────────────────────────────

function addContact(data) {
  const db = getDb();
  const id = genId();
  db.prepare(`
    INSERT INTO contacts (id, name, email, phone, subject, message, read, ip, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    id,
    data.name || '',
    data.email || '',
    data.phone || '',
    data.subject || 'General Enquiry',
    data.message || '',
    data.ip || 'unknown',
    now(),
  );
  return { id };
}

function getContacts() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM contacts ORDER BY createdAt DESC').all();
  return rows.map(formatRow);
}

function markContactRead(id) {
  const db = getDb();
  db.prepare('UPDATE contacts SET read = 1 WHERE id = ?').run(id);
}

function deleteContact(id) {
  const db = getDb();
  db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
}

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────

function getAdminStats() {
  const db = getDb();

  const donation = db.prepare(
    'SELECT COUNT(*) as total, COALESCE(SUM(amount), 0) as raised FROM donations WHERE status = \'approved\''
  ).get();
  const pendingDonations = db.prepare(
    "SELECT COUNT(*) as total, COALESCE(SUM(amount), 0) as amount FROM donations WHERE status = 'pending'"
  ).get();
  const allDonations = db.prepare('SELECT COUNT(*) as total FROM donations').get();
  const campaigns = db.prepare('SELECT COUNT(*) as total FROM campaigns').get();
  const activeCamp = db.prepare('SELECT COUNT(*) as total FROM campaigns WHERE active = 1').get();
  const volunteers = db.prepare('SELECT COUNT(*) as total FROM volunteers').get();
  const pendingVol = db.prepare("SELECT COUNT(*) as total FROM volunteers WHERE status = 'pending'").get();
  const unreadMsg = db.prepare('SELECT COUNT(*) as total FROM contacts WHERE read = 0').get();
  const newsletter = db.prepare('SELECT COUNT(*) as total FROM newsletter WHERE active = 1').get();

  // Monthly breakdown (last 6 months) — approved only
  const monthlyRows = db.prepare(`
    SELECT strftime('%Y-%m', createdAt) as month, SUM(amount) as amount
    FROM donations
    WHERE createdAt >= date('now', '-6 months') AND status = 'approved'
    GROUP BY month
    ORDER BY month ASC
  `).all();

  return {
    totalRaised: donation.raised,
    totalDonations: donation.total,
    allDonationsCount: allDonations.total,
    pendingDonations: pendingDonations.total,
    pendingDonationAmount: pendingDonations.amount,
    activeCampaigns: activeCamp.total,
    totalCampaigns: campaigns.total,
    totalVolunteers: volunteers.total,
    pendingVolunteers: pendingVol.total,
    unreadContacts: unreadMsg.total,
    newsletterSubscribers: newsletter.total,
    monthlyData: monthlyRows.map(r => ({ month: r.month, amount: r.amount || 0 })),
  };
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

module.exports = {
  // Admin Users
  authenticateAdmin,
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
  // Campaigns
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  // Donations
  submitDonation,
  getDonations,
  getDonation,
  getDonationsByCampaign,
  getDonationsByStatus,
  updateDonationStatus,
  // Data Management
  purgeAllData,
  // Stats
  getStats,
  getAdminStats,
  // Volunteers
  addVolunteer,
  getVolunteers,
  updateVolunteerStatus,
  deleteVolunteer,
  // Newsletter
  addNewsletter,
  getNewsletterSubscribers,
  unsubscribeNewsletter,
  unsubscribeNewsletterByEmail,
  // Contacts
  addContact,
  getContacts,
  markContactRead,
  deleteContact,
};
