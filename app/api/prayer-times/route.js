// app/api/prayer-times/route.js
import { NextResponse } from 'next/server';

// Static fallback times for Chandpur, Bangladesh (approximate)
const STATIC_TIMES = {
  Fajr:    { adhan: '4:30 AM', iqama: '4:50 AM' },
  Sunrise: { adhan: '5:45 AM', iqama: null },
  Dhuhr:   { adhan: '12:05 PM', iqama: '1:15 PM' },
  Asr:     { adhan: '3:30 PM', iqama: '4:00 PM' },
  Maghrib: { adhan: '6:05 PM', iqama: '6:10 PM' },
  Isha:    { adhan: '7:20 PM', iqama: '7:45 PM' },
  Jumuah:  { adhan: '12:30 PM', iqama: '1:15 PM' },
};

/**
 * GET /api/prayer-times
 * Returns today's prayer times for Chandpur Matlab by default.
 * Optional: ?city=Chandpur&country=BD&method=1 for Aladhan API integration
 * Method 1 = University of Islamic Sciences, Karachi (common for Bangladesh)
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'Chandpur';
  const country = searchParams.get('country') || 'BD';
  const method = searchParams.get('method') || '1'; // Karachi method — best for Bangladesh

  // Attempt to fetch from Aladhan API
  try {
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${country}&method=${method}`,
      { next: { revalidate: 3600 } } // cache for 1 hour
    );

    if (res.ok) {
      const data = await res.json();
      const t = data.data?.timings;
      if (t) {
        return NextResponse.json({
          source: 'aladhan',
          date: data.data.date?.readable,
          location: `${city}, ${country}`,
          method: data.data.meta?.method?.name,
          times: {
            Fajr:    { adhan: formatTime(t.Fajr),    iqama: addMinutes(t.Fajr, 20) },
            Sunrise: { adhan: formatTime(t.Sunrise),  iqama: null },
            Dhuhr:   { adhan: formatTime(t.Dhuhr),   iqama: addMinutes(t.Dhuhr, 30) },
            Asr:     { adhan: formatTime(t.Asr),     iqama: addMinutes(t.Asr, 15) },
            Maghrib: { adhan: formatTime(t.Maghrib),  iqama: addMinutes(t.Maghrib, 5) },
            Isha:    { adhan: formatTime(t.Isha),    iqama: addMinutes(t.Isha, 15) },
            Jumuah:  STATIC_TIMES.Jumuah,
          },
        });
      }
    }
  } catch (e) {
    // Fall through to static fallback
    console.warn('Aladhan API failed, using static times:', e.message);
  }

  // Return static/configured times
  return NextResponse.json({
    source: 'static',
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    location: 'Matlab, Chandpur, Bangladesh',
    note: 'Live prayer times via Aladhan API (Karachi method)',
    times: STATIC_TIMES,
  });
}

/** Format 24h "HH:MM" to "H:MM AM/PM" */
function formatTime(timeStr) {
  if (!timeStr) return null;
  // Aladhan may return "HH:MM (BST)" — strip timezone info
  const clean = timeStr.replace(/\s*\(.*\)/, '').trim();
  const [h, m] = clean.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Add N minutes to a HH:MM time string, return "H:MM AM/PM" */
function addMinutes(timeStr, mins) {
  if (!timeStr) return null;
  const clean = timeStr.replace(/\s*\(.*\)/, '').trim();
  const [h, m] = clean.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  const ampm = nh >= 12 ? 'PM' : 'AM';
  const displayH = nh % 12 || 12;
  return `${displayH}:${String(nm).padStart(2, '0')} ${ampm}`;
}
