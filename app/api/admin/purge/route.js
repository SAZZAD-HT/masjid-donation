// app/api/admin/purge/route.js
import { NextResponse } from 'next/server';
import { authenticateAdmin, purgeAllData } from '@/lib/queries';

export async function DELETE(request) {
  // Double-verification: require super_admin credentials
  const username = request.headers.get('x-admin-user');
  const password = request.headers.get('x-admin-pass');
  const confirmPassword = request.headers.get('x-confirm-password');

  if (!username || !password) {
    return NextResponse.json({ error: 'Credentials required' }, { status: 401 });
  }

  const user = authenticateAdmin(username, password);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
  }

  // Require password re-entry as confirmation
  if (confirmPassword !== password) {
    return NextResponse.json({ error: 'Password confirmation failed' }, { status: 400 });
  }

  try {
    purgeAllData();
    return NextResponse.json({
      success: true,
      message: 'All data (donations, campaigns, contacts, volunteers, newsletter) has been purged. Admin users preserved.',
    });
  } catch (e) {
    console.error('Purge error:', e);
    return NextResponse.json({ error: 'Purge failed: ' + e.message }, { status: 500 });
  }
}
