// lib/utils.js

/**
 * Format a number as BDT currency (Bangladeshi Taka ৳)
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount, decimals = 0) {
  return '৳' + Number(amount).toLocaleString('en-BD', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a Firestore timestamp to a readable date string
 * @param {{ seconds: number } | null} timestamp
 * @param {Intl.DateTimeFormatOptions} options
 */
export function formatDate(timestamp, options = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!timestamp?.seconds) return '—';
  return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', options);
}

/**
 * Calculate progress percentage (capped at 100)
 * @param {number} raised
 * @param {number} goal
 */
export function calcProgress(raised, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

/**
 * Calculate days remaining until a date string
 * @param {string} dateStr - ISO date string YYYY-MM-DD
 */
export function daysLeft(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

/**
 * Truncate text to a given character limit
 */
export function truncate(str, limit = 120) {
  if (!str) return '';
  return str.length > limit ? str.slice(0, limit) + '…' : str;
}

/**
 * Generate initials from a name (up to 2 chars)
 */
export function initials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

// ── Donation category config ─────────────────────────────────────────────────
export const CATEGORY_CONFIG = {
  masjid:    { icon: '🕌', label: 'Masjid', color: '#1a5c38' },
  education: { icon: '📚', label: 'Education', color: '#6366f1' },
  food:      { icon: '🍽️', label: 'Food', color: '#f59e0b' },
  relief:    { icon: '🤲', label: 'Relief', color: '#ef4444' },
  water:     { icon: '💧', label: 'Water', color: '#0ea5e9' },
  medical:   { icon: '🏥', label: 'Medical', color: '#ec4899' },
  youth:     { icon: '⭐', label: 'Youth', color: '#8b5cf6' },
  zakat:     { icon: '💰', label: 'Zakat', color: '#c9973a' },
  general:   { icon: '☪️', label: 'General', color: '#64748b' },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG);
