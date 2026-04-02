// lib/queries.js
// All database queries — Supabase PostgreSQL version
import supabase from './db';

function genId() {
  return crypto.randomUUID();
}

// Helper: convert Supabase row to match existing UI format (createdAt as object with seconds)
function formatRow(row) {
  if (!row) return null;
  return {
    ...row,
    // Parse JSONB arrays if they come as strings (shouldn't normally, but safety)
    ...(row.roles && typeof row.roles === 'string' ? { roles: JSON.parse(row.roles) } : {}),
    ...(row.availability && typeof row.availability === 'string' ? { availability: JSON.parse(row.availability) } : {}),
    ...(row.skills && typeof row.skills === 'string' ? { skills: JSON.parse(row.skills) } : {}),
    // createdAt as object with seconds for compatibility with existing UI code
    createdAt: row.createdAt
      ? { seconds: Math.floor(new Date(row.createdAt).getTime() / 1000) }
      : null,
  };
}

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────

export async function authenticateAdmin(username, password) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !data) return null;
  const { password: _, ...safe } = data;
  return {
    ...safe,
    createdAt: data.createdAt
      ? { seconds: Math.floor(new Date(data.createdAt).getTime() / 1000) }
      : null,
  };
}

export async function getAdminUsers() {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, role, displayName, email, createdAt')
    .order('createdAt', { ascending: true });

  if (error) throw error;
  return (data || []).map(u => ({
    ...u,
    createdAt: u.createdAt
      ? { seconds: Math.floor(new Date(u.createdAt).getTime() / 1000) }
      : null,
  }));
}

export async function createAdminUser(userData) {
  const id = genId();

  // Check for duplicate username
  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .eq('username', userData.username)
    .single();

  if (existing) throw new Error('Username already exists');

  const { error } = await supabase.from('admin_users').insert({
    id,
    username: userData.username,
    password: userData.password,
    role: userData.role || 'admin',
    displayName: userData.displayName || userData.username,
    email: userData.email || '',
  });

  if (error) throw error;
  return { id };
}

export async function deleteAdminUser(id) {
  // Prevent deleting the last super_admin
  const { data: user } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', id)
    .single();

  if (user?.role === 'super_admin') {
    const { count } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'super_admin');

    if (count <= 1) throw new Error('Cannot delete the last Super Admin');
  }

  const { error } = await supabase.from('admin_users').delete().eq('id', id);
  if (error) throw error;
}

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────

export async function getCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return (data || []).map(formatRow);
}

export async function getCampaign(id) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return formatRow(data);
}

export async function createCampaign(campaignData) {
  const id = genId();
  const { error } = await supabase.from('campaigns').insert({
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
  });

  if (error) throw error;
  return { id };
}

export async function updateCampaign(id, data) {
  const updates = {};
  for (const [key, val] of Object.entries(data)) {
    if (key === 'id' || key === 'createdAt') continue;
    updates[key] = val;
  }

  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteCampaign(id) {
  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) throw error;
}

// ─── DONATIONS ────────────────────────────────────────────────────────────────

export async function submitDonation(donationData) {
  const id = genId();
  const { campaignId, amount, ...rest } = donationData;
  const numAmount = Number(amount);
  const status = rest.status || 'pending';

  // Insert the donation
  const { error: insertError } = await supabase.from('donations').insert({
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
  });

  if (insertError) throw insertError;

  // If auto-approved (admin manual entry), update campaign immediately
  if (status === 'approved' && campaignId) {
    // Get current campaign values
    const { data: camp } = await supabase
      .from('campaigns')
      .select('raisedAmount, donorCount')
      .eq('id', campaignId)
      .single();

    if (camp) {
      await supabase
        .from('campaigns')
        .update({
          raisedAmount: (camp.raisedAmount || 0) + numAmount,
          donorCount: (camp.donorCount || 0) + 1,
        })
        .eq('id', campaignId);
    }
  }

  return { id, status };
}

export async function updateDonationStatus(id, status, approvedBy) {
  // Get the current donation
  const { data: donation, error: fetchError } = await supabase
    .from('donations')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !donation) throw new Error('Donation not found');

  // Update donation status
  const { error: updateError } = await supabase
    .from('donations')
    .update({
      status,
      approvedBy: approvedBy || '',
      approvedAt: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) throw updateError;

  // When approving, add to campaign totals
  if (status === 'approved' && donation.status !== 'approved' && donation.campaignId) {
    const { data: camp } = await supabase
      .from('campaigns')
      .select('raisedAmount, donorCount')
      .eq('id', donation.campaignId)
      .single();

    if (camp) {
      await supabase
        .from('campaigns')
        .update({
          raisedAmount: (camp.raisedAmount || 0) + donation.amount,
          donorCount: (camp.donorCount || 0) + 1,
        })
        .eq('id', donation.campaignId);
    }
  }

  // When rejecting a previously approved donation, subtract from campaign
  if (status === 'rejected' && donation.status === 'approved' && donation.campaignId) {
    const { data: camp } = await supabase
      .from('campaigns')
      .select('raisedAmount, donorCount')
      .eq('id', donation.campaignId)
      .single();

    if (camp) {
      await supabase
        .from('campaigns')
        .update({
          raisedAmount: Math.max(0, (camp.raisedAmount || 0) - donation.amount),
          donorCount: Math.max(0, (camp.donorCount || 0) - 1),
        })
        .eq('id', donation.campaignId);
    }
  }
}

export async function getDonations(limit = null) {
  let query = supabase
    .from('donations')
    .select('*')
    .order('createdAt', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(formatRow);
}

export async function getDonation(id) {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return formatRow(data);
}

export async function getDonationsByCampaign(campaignId) {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('campaignId', campaignId)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return (data || []).map(formatRow);
}

export async function getDonationsByStatus(status) {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('status', status)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return (data || []).map(formatRow);
}

// ─── DATA PURGE ───────────────────────────────────────────────────────────────

export async function purgeAllData() {
  // Delete all data except admin_users
  await supabase.from('donations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('campaigns').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('volunteers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('newsletter').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

// ─── STATS ────────────────────────────────────────────────────────────────────

export async function getStats() {
  const { data: donations } = await supabase
    .from('donations')
    .select('amount')
    .eq('status', 'approved');

  const totalDonations = donations?.length || 0;
  const totalRaised = (donations || []).reduce((s, d) => s + (d.amount || 0), 0);

  const { count: totalCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true });

  const { count: activeCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  return {
    totalDonations,
    totalRaised,
    activeCampaigns: activeCampaigns || 0,
    totalCampaigns: totalCampaigns || 0,
  };
}

// ─── VOLUNTEERS ──────────────────────────────────────────────────────────────

export async function addVolunteer(data) {
  const id = genId();
  const { error } = await supabase.from('volunteers').insert({
    id,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    roles: data.roles || [],
    availability: data.availability || [],
    skills: data.skills || [],
    message: data.message || '',
    status: 'pending',
  });

  if (error) throw error;
  return { id };
}

export async function getVolunteers() {
  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return (data || []).map(formatRow);
}

export async function updateVolunteerStatus(id, status) {
  const { error } = await supabase
    .from('volunteers')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteVolunteer(id) {
  const { error } = await supabase.from('volunteers').delete().eq('id', id);
  if (error) throw error;
}

// ─── NEWSLETTER ──────────────────────────────────────────────────────────────

export async function addNewsletter(email) {
  const id = genId();
  const { error } = await supabase.from('newsletter').insert({
    id,
    email: email.trim().toLowerCase(),
    active: true,
  });

  if (error) throw error;
  return { id };
}

export async function getNewsletterSubscribers() {
  const { data, error } = await supabase
    .from('newsletter')
    .select('*')
    .eq('active', true)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return (data || []).map(formatRow);
}

export async function unsubscribeNewsletter(id) {
  const { error } = await supabase
    .from('newsletter')
    .update({ active: false })
    .eq('id', id);

  if (error) throw error;
}

export async function unsubscribeNewsletterByEmail(email) {
  const { data, error } = await supabase
    .from('newsletter')
    .update({ active: false })
    .eq('email', email.trim().toLowerCase())
    .eq('active', true)
    .select();

  if (error) throw error;
  return (data?.length || 0) > 0;
}

// ─── CONTACTS ─────────────────────────────────────────────────────────────────

export async function addContact(data) {
  const id = genId();
  const { error } = await supabase.from('contacts').insert({
    id,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    subject: data.subject || 'General Enquiry',
    message: data.message || '',
    read: false,
    ip: data.ip || 'unknown',
  });

  if (error) throw error;
  return { id };
}

export async function getContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return (data || []).map(formatRow);
}

export async function markContactRead(id) {
  const { error } = await supabase
    .from('contacts')
    .update({ read: true })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteContact(id) {
  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) throw error;
}

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────

export async function getAdminStats() {
  // Approved donations
  const { data: approvedDonations } = await supabase
    .from('donations')
    .select('amount')
    .eq('status', 'approved');

  const totalRaised = (approvedDonations || []).reduce((s, d) => s + (d.amount || 0), 0);

  // Pending donations
  const { data: pendingDonations } = await supabase
    .from('donations')
    .select('amount')
    .eq('status', 'pending');

  const pendingAmount = (pendingDonations || []).reduce((s, d) => s + (d.amount || 0), 0);

  // All donations count
  const { count: allDonationsCount } = await supabase
    .from('donations')
    .select('*', { count: 'exact', head: true });

  // Campaigns
  const { count: totalCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true });

  const { count: activeCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  // Volunteers
  const { count: totalVolunteers } = await supabase
    .from('volunteers')
    .select('*', { count: 'exact', head: true });

  const { count: pendingVolunteers } = await supabase
    .from('volunteers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Unread contacts
  const { count: unreadContacts } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('read', false);

  // Newsletter
  const { count: newsletterSubscribers } = await supabase
    .from('newsletter')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  // Monthly breakdown (last 6 months) — approved only
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: recentDonations } = await supabase
    .from('donations')
    .select('amount, createdAt')
    .eq('status', 'approved')
    .gte('createdAt', sixMonthsAgo.toISOString());

  // Group by month
  const monthlyMap = {};
  (recentDonations || []).forEach(d => {
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
    totalDonations: approvedDonations?.length || 0,
    allDonationsCount: allDonationsCount || 0,
    pendingDonations: pendingDonations?.length || 0,
    pendingDonationAmount: pendingAmount,
    activeCampaigns: activeCampaigns || 0,
    totalCampaigns: totalCampaigns || 0,
    totalVolunteers: totalVolunteers || 0,
    pendingVolunteers: pendingVolunteers || 0,
    unreadContacts: unreadContacts || 0,
    newsletterSubscribers: newsletterSubscribers || 0,
    monthlyData,
  };
}
