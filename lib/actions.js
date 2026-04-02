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

// We wrap them in async functions to ensure they meet the Server Actions contract
export async function srvGetCampaigns() { return getCampaigns(); }
export async function srvGetCampaign(id) { return getCampaign(id); }
export async function srvCreateCampaign(data) { return createCampaign(data); }
export async function srvUpdateCampaign(id, data) { return updateCampaign(id, data); }
export async function srvDeleteCampaign(id) { return deleteCampaign(id); }

export async function srvGetDonations(limit) { return getDonations(limit); }
export async function srvGetDonationsByCampaign(id) { return getDonationsByCampaign(id); }
export async function srvSubmitDonation(data) { return submitDonation(data); }

export async function srvGetVolunteers() { return getVolunteers(); }
export async function srvSubmitVolunteer(data) { return addVolunteer(data); }
export async function srvUpdateVolunteerStatus(id, status) { return updateVolunteerStatus(id, status); }
export async function srvDeleteVolunteer(id) { return deleteVolunteer(id); }

export async function srvGetNewsletterSubscribers() { return getNewsletterSubscribers(); }
export async function srvSubscribeNewsletter(email) { return addNewsletter(email); }
export async function srvUnsubscribeNewsletter(id) { return unsubscribeNewsletter(id); }

export async function srvGetContacts() { return getContacts(); }
export async function srvSubmitContact(data) { return addContact(data); }
export async function srvMarkContactRead(id) { return markContactRead(id); }
export async function srvDeleteContact(id) { return deleteContact(id); }

export async function srvGetStats() { return getStats(); }
export async function srvGetAdminStats() { return getAdminStats(); }

// Admin features
export async function srvAuthenticateAdmin(u,p) { return authenticateAdmin(u,p); }
export async function srvGetAdminUsers() { return getAdminUsers(); }
export async function srvCreateAdminUser(data) { return createAdminUser(data); }
export async function srvDeleteAdminUser(id) { return deleteAdminUser(id); }
export async function srvUpdateDonationStatus(id,status,by) { return updateDonationStatus(id,status,by); }
export async function srvGetDonationsByStatus(status) { return getDonationsByStatus(status); }
export async function srvPurgeAllData() { return purgeAllData(); }
