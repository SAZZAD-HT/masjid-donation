// app/api/admin/donations/route.js
import { NextResponse } from 'next/server';
import { authenticateAdmin, updateDonationStatus, submitDonation, getDonationsByStatus } from '@/lib/queries';

function verifyAdmin(request) {
  const username = request.headers.get('x-admin-user');
  const password = request.headers.get('x-admin-pass');
  if (!username || !password) return null;
  return authenticateAdmin(username, password);
}

// GET — get donations by status
export async function GET(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';
  const donations = getDonationsByStatus(status);
  return NextResponse.json(donations);
}

// POST — admin enters a manual donation (auto-approved)
export async function POST(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const data = await request.json();
    if (!data.amount || Number(data.amount) <= 0) {
      return NextResponse.json({ error: 'Valid amount required' }, { status: 400 });
    }
    // Manual entry is auto-approved
    const result = submitDonation({
      ...data,
      status: 'approved',
      approvedBy: admin.username,
      approvedAt: new Date().toISOString(),
      paymentMethod: data.paymentMethod || 'cash',
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH — approve or reject a donation
export async function PATCH(request) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const { id, status } = await request.json();
    if (!id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Valid id and status (approved/rejected) required' }, { status: 400 });
    }
    updateDonationStatus(id, status, admin.username);
    return NextResponse.json({ success: true, id, status });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
