'use server';

import {
  getCampaigns, getCampaign, createCampaign, updateCampaign, deleteCampaign,
  getDonations, getDonationsByCampaign, submitDonation, updateDonationStatus, getDonationsByStatus,
  getVolunteers, addVolunteer, updateVolunteerStatus, deleteVolunteer,
  getNewsletterSubscribers, addNewsletter, unsubscribeNewsletter,
  getContacts, addContact, markContactRead, deleteContact,
  getStats, getAdminStats,
  authenticateAdmin, getAdminUsers, createAdminUser, deleteAdminUser,
  purgeAllData,
} from './queries';

// All queries are now async — pass through with await
export async function srvGetCampaigns() { return await getCampaigns(); }
export async function srvGetCampaign(id) { return await getCampaign(id); }
export async function srvCreateCampaign(data) { return await createCampaign(data); }
export async function srvUpdateCampaign(id, data) { return await updateCampaign(id, data); }
export async function srvDeleteCampaign(id) { return await deleteCampaign(id); }

export async function srvGetDonations(limit) { return await getDonations(limit); }
export async function srvGetDonationsByCampaign(id) { return await getDonationsByCampaign(id); }
export async function srvSubmitDonation(data) { return await submitDonation(data); }

export async function srvGetVolunteers() { return await getVolunteers(); }
export async function srvSubmitVolunteer(data) { return await addVolunteer(data); }
export async function srvUpdateVolunteerStatus(id, status) { return await updateVolunteerStatus(id, status); }
export async function srvDeleteVolunteer(id) { return await deleteVolunteer(id); }

export async function srvGetNewsletterSubscribers() { return await getNewsletterSubscribers(); }
export async function srvSubscribeNewsletter(email) { return await addNewsletter(email); }
export async function srvUnsubscribeNewsletter(id) { return await unsubscribeNewsletter(id); }

export async function srvGetContacts() { return await getContacts(); }
export async function srvSubmitContact(data) { return await addContact(data); }
export async function srvMarkContactRead(id) { return await markContactRead(id); }
export async function srvDeleteContact(id) { return await deleteContact(id); }

export async function srvGetStats() { return await getStats(); }
export async function srvGetAdminStats() { return await getAdminStats(); }

// Admin features
export async function srvAuthenticateAdmin(u,p) { return await authenticateAdmin(u,p); }
export async function srvGetAdminUsers() { return await getAdminUsers(); }
export async function srvCreateAdminUser(data) { return await createAdminUser(data); }
export async function srvDeleteAdminUser(id) { return await deleteAdminUser(id); }
export async function srvUpdateDonationStatus(id,status,by) { return await updateDonationStatus(id,status,by); }
export async function srvGetDonationsByStatus(status) { return await getDonationsByStatus(status); }
export async function srvPurgeAllData() { return await purgeAllData(); }
