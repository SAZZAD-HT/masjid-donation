// lib/queries.js
// All database queries — Prisma ORM version
import prisma from './db';

function genId() {
  return crypto.randomUUID();
}

// Helper: convert Prisma row to match existing UI format (createdAt as object with seconds)
function formatRow(row) {
  if (!row) return null;
  return {
    ...row,
    // createdAt as object with seconds for compatibility with existing UI code
    createdAt: row.createdAt
      ? { seconds: Math.floor(new Date(row.createdAt).getTime() / 1000) }
      : null,
  };
}

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────

export async function authenticateAdmin(username, password) {
  const user = await prisma.admin_users.findFirst({
    where: { username, password },
  });

  if (!user) return null;
  const { password: _, ...safe } = user;
  return {
    ...safe,
    createdAt: user.createdAt
      ? { seconds: Math.floor(new Date(user.createdAt).getTime() / 1000) }
      : null,
  };
}

export async function getAdminUsers() {
  const users = await prisma.admin_users.findMany({
    select: { id: true, username: true, role: true, displayName: true, email: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return users.map(u => ({
    ...u,
    createdAt: u.createdAt
      ? { seconds: Math.floor(new Date(u.createdAt).getTime() / 1000) }
      : null,
  }));
}

export async function createAdminUser(userData) {
  // Check for duplicate username
  const existing = await prisma.admin_users.findUnique({
    where: { username: userData.username },
  });

  if (existing) throw new Error('Username already exists');

  const user = await prisma.admin_users.create({
    data: {
      id: genId(),
      username: userData.username,
      password: userData.password,
      role: userData.role || 'admin',
      displayName: userData.displayName || userData.username,
      email: userData.email || '',
    },
  });

  return { id: user.id };
}

export async function deleteAdminUser(id) {
  // Prevent deleting the last super_admin
  const user = await prisma.admin_users.findUnique({ where: { id } });

  if (user?.role === 'super_admin') {
    const count = await prisma.admin_users.count({
      where: { role: 'super_admin' },
    });
    if (count <= 1) throw new Error('Cannot delete the last Super Admin');
  }

  await prisma.admin_users.delete({ where: { id } });
}

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────

export async function getCampaigns() {
  const campaigns = await prisma.campaigns.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return campaigns.map(formatRow);
}

export async function getCampaign(id) {
  const campaign = await prisma.campaigns.findUnique({ where: { id } });
  return formatRow(campaign);
}

export async function createCampaign(campaignData) {
  const id = genId();
  await prisma.campaigns.create({
    data: {
      id,
      title: campaignData.title || '',
      description: campaignData.description || '',
      goalAmount: Number(campaignData.goalAmount) || 0,
      raisedAmount: 0,
      donorCount: 0,
      category: campaignData.category || 'general',
      endDate: campaignData.endDate || '',
      imageUrl: campaignData.imageUrl || '',
      active: true,
    },
  });

  return { id };
}

export async function updateCampaign(id, data) {
  const updates = {};
  for (const [key, val] of Object.entries(data)) {
    if (key === 'id' || key === 'createdAt') continue;
    updates[key] = val;
  }

  if (Object.keys(updates).length === 0) return;

  await prisma.campaigns.update({
    where: { id },
    data: updates,
  });
}

export async function deleteCampaign(id) {
  await prisma.campaigns.delete({ where: { id } });
}

// ─── DONATIONS ────────────────────────────────────────────────────────────────

export async function submitDonation(donationData) {
  const id = genId();
  const { campaignId, amount, ...rest } = donationData;
  const numAmount = Number(amount);
  const status = rest.status || 'pending';

  // Insert the donation
  await prisma.donations.create({
    data: {
      id,
      donorName: rest.donorName || 'Anonymous',
      email: rest.email || '',
      phone: rest.phone || '',
      amount: numAmount,
      campaignId: campaignId || '',
      category: rest.category || 'general',
      donationType: rest.donationType || 'one-time',
      paymentMethod: rest.paymentMethod || 'card',
      message: rest.message || '',
      anonymous: rest.anonymous ? true : false,
      status,
      approvedBy: rest.approvedBy || '',
      approvedAt: rest.approvedAt || '',
    },
  });

  // If auto-approved (admin manual entry), update campaign immediately
  if (status === 'approved' && campaignId) {
    const camp = await prisma.campaigns.findUnique({
      where: { id: campaignId },
      select: { raisedAmount: true, donorCount: true },
    });

    if (camp) {
      await prisma.campaigns.update({
        where: { id: campaignId },
        data: {
          raisedAmount: (camp.raisedAmount || 0) + numAmount,
          donorCount: (camp.donorCount || 0) + 1,
        },
      });
    }
  }

  return { id, status };
}

export async function updateDonationStatus(id, status, approvedBy) {
  // Get the current donation
  const donation = await prisma.donations.findUnique({ where: { id } });

  if (!donation) throw new Error('Donation not found');

  // Update donation status
  await prisma.donations.update({
    where: { id },
    data: {
      status,
      approvedBy: approvedBy || '',
      approvedAt: new Date().toISOString(),
    },
  });

  // When approving, add to campaign totals
  if (status === 'approved' && donation.status !== 'approved' && donation.campaignId) {
    const camp = await prisma.campaigns.findUnique({
      where: { id: donation.campaignId },
      select: { raisedAmount: true, donorCount: true },
    });

    if (camp) {
      await prisma.campaigns.update({
        where: { id: donation.campaignId },
        data: {
          raisedAmount: (camp.raisedAmount || 0) + donation.amount,
          donorCount: (camp.donorCount || 0) + 1,
        },
      });
    }
  }

  // When rejecting a previously approved donation, subtract from campaign
  if (status === 'rejected' && donation.status === 'approved' && donation.campaignId) {
    const camp = await prisma.campaigns.findUnique({
      where: { id: donation.campaignId },
      select: { raisedAmount: true, donorCount: true },
    });

    if (camp) {
      await prisma.campaigns.update({
        where: { id: donation.campaignId },
        data: {
          raisedAmount: Math.max(0, (camp.raisedAmount || 0) - donation.amount),
          donorCount: Math.max(0, (camp.donorCount || 0) - 1),
        },
      });
    }
  }
}

export async function getDonations(limit = null) {
  const donations = await prisma.donations.findMany({
    orderBy: { createdAt: 'desc' },
    ...(limit ? { take: limit } : {}),
  });
  return donations.map(formatRow);
}

export async function getDonation(id) {
  const donation = await prisma.donations.findUnique({ where: { id } });
  return formatRow(donation);
}

export async function getDonationsByCampaign(campaignId) {
  const donations = await prisma.donations.findMany({
    where: { campaignId },
    orderBy: { createdAt: 'desc' },
  });
  return donations.map(formatRow);
}

export async function getDonationsByStatus(status) {
  const donations = await prisma.donations.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
  });
  return donations.map(formatRow);
}

// ─── DATA PURGE ───────────────────────────────────────────────────────────────

export async function purgeAllData() {
  // Delete all data except admin_users
  await prisma.donations.deleteMany({});
  await prisma.campaigns.deleteMany({});
  await prisma.contacts.deleteMany({});
  await prisma.volunteers.deleteMany({});
  await prisma.newsletter.deleteMany({});
}

// ─── STATS ────────────────────────────────────────────────────────────────────

export async function getStats() {
  const approvedDonations = await prisma.donations.findMany({
    where: { status: 'approved' },
    select: { amount: true },
  });

  const totalDonations = approvedDonations.length;
  const totalRaised = approvedDonations.reduce((s, d) => s + (d.amount || 0), 0);

  const totalCampaigns = await prisma.campaigns.count();
  const activeCampaigns = await prisma.campaigns.count({ where: { active: true } });

  return {
    totalDonations,
    totalRaised,
    activeCampaigns,
    totalCampaigns,
  };
}

// ─── VOLUNTEERS ──────────────────────────────────────────────────────────────

export async function addVolunteer(data) {
  const id = genId();
  await prisma.volunteers.create({
    data: {
      id,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      roles: data.roles || [],
      availability: data.availability || [],
      skills: data.skills || [],
      message: data.message || '',
      status: 'pending',
    },
  });

  return { id };
}

export async function getVolunteers() {
  const volunteers = await prisma.volunteers.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return volunteers.map(formatRow);
}

export async function updateVolunteerStatus(id, status) {
  await prisma.volunteers.update({
    where: { id },
    data: { status },
  });
}

export async function deleteVolunteer(id) {
  await prisma.volunteers.delete({ where: { id } });
}

// ─── NEWSLETTER ──────────────────────────────────────────────────────────────

export async function addNewsletter(email) {
  const id = genId();
  await prisma.newsletter.create({
    data: {
      id,
      email: email.trim().toLowerCase(),
      active: true,
    },
  });

  return { id };
}

export async function getNewsletterSubscribers() {
  const subscribers = await prisma.newsletter.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  });
  return subscribers.map(formatRow);
}

export async function unsubscribeNewsletter(id) {
  await prisma.newsletter.update({
    where: { id },
    data: { active: false },
  });
}

export async function unsubscribeNewsletterByEmail(email) {
  const result = await prisma.newsletter.updateMany({
    where: {
      email: email.trim().toLowerCase(),
      active: true,
    },
    data: { active: false },
  });

  return result.count > 0;
}

// ─── CONTACTS ─────────────────────────────────────────────────────────────────

export async function addContact(data) {
  const id = genId();
  await prisma.contacts.create({
    data: {
      id,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      subject: data.subject || 'General Enquiry',
      message: data.message || '',
      read: false,
      ip: data.ip || 'unknown',
    },
  });

  return { id };
}

export async function getContacts() {
  const contacts = await prisma.contacts.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return contacts.map(formatRow);
}

export async function markContactRead(id) {
  await prisma.contacts.update({
    where: { id },
    data: { read: true },
  });
}

export async function deleteContact(id) {
  await prisma.contacts.delete({ where: { id } });
}

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────

export async function getAdminStats() {
  // Approved donations
  const approvedDonations = await prisma.donations.findMany({
    where: { status: 'approved' },
    select: { amount: true },
  });

  const totalRaised = approvedDonations.reduce((s, d) => s + (d.amount || 0), 0);

  // Pending donations
  const pendingDonations = await prisma.donations.findMany({
    where: { status: 'pending' },
    select: { amount: true },
  });

  const pendingAmount = pendingDonations.reduce((s, d) => s + (d.amount || 0), 0);

  // All donations count
  const allDonationsCount = await prisma.donations.count();

  // Campaigns
  const totalCampaigns = await prisma.campaigns.count();
  const activeCampaigns = await prisma.campaigns.count({ where: { active: true } });

  // Volunteers
  const totalVolunteers = await prisma.volunteers.count();
  const pendingVolunteers = await prisma.volunteers.count({ where: { status: 'pending' } });

  // Unread contacts
  const unreadContacts = await prisma.contacts.count({ where: { read: false } });

  // Newsletter
  const newsletterSubscribers = await prisma.newsletter.count({ where: { active: true } });

  // Monthly breakdown (last 6 months) — approved only
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentDonations = await prisma.donations.findMany({
    where: {
      status: 'approved',
      createdAt: { gte: sixMonthsAgo },
    },
    select: { amount: true, createdAt: true },
  });

  // Group by month
  const monthlyMap = {};
  recentDonations.forEach(d => {
    if (!d.createdAt) return;
    const dt = new Date(d.createdAt);
    const month = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap[month] = (monthlyMap[month] || 0) + (d.amount || 0);
  });

  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));

  return {
    totalRaised,
    totalDonations: approvedDonations.length,
    allDonationsCount,
    pendingDonations: pendingDonations.length,
    pendingDonationAmount: pendingAmount,
    activeCampaigns,
    totalCampaigns,
    totalVolunteers,
    pendingVolunteers,
    unreadContacts,
    newsletterSubscribers,
    monthlyData,
  };
}
