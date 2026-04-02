'use client';
// lib/hooks.js
import { useState, useEffect, useCallback } from 'react';

// Client-side hooks fetch data through API routes instead of direct DB access

/**
 * Fetch all campaigns with optional filter
 */
export function useCampaigns({ activeOnly = false } = {}) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setCampaigns(activeOnly ? data.filter(c => c.active) : data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => { load(); }, [load]);
  return { campaigns, loading, error, reload: load };
}

/**
 * Fetch a single campaign by ID
 */
export function useCampaign(id) {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/campaigns?id=${id}`)
      .then(r => r.json())
      .then(setCampaign)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { campaign, loading, error };
}

/**
 * Fetch donations (all, or by campaign ID)
 */
export function useDonations(campaignId = null) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = campaignId
      ? `/api/donations?campaignId=${campaignId}`
      : '/api/donations';
    fetch(url)
      .then(r => r.json())
      .then(setDonations)
      .finally(() => setLoading(false));
  }, [campaignId]);

  return { donations, loading };
}

/**
 * Fetch platform-wide statistics
 */
export function useStats() {
  const [stats, setStats] = useState({ totalRaised: 0, totalDonations: 0, activeCampaigns: 0, totalCampaigns: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

/**
 * Debounce a value (for search inputs)
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
