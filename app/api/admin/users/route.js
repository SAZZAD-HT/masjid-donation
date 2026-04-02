// app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { authenticateAdmin, getAdminUsers, createAdminUser, deleteAdminUser } from '@/lib/queries';

// Verify super_admin role
function verifySuperAdmin(request) {
  const username = request.headers.get('x-admin-user');
  const password = request.headers.get('x-admin-pass');
  if (!username || !password) return null;
  const user = authenticateAdmin(username, password);
  if (!user || user.role !== 'super_admin') return null;
  return user;
}

// GET — list all admin users
export async function GET(request) {
  const admin = verifySuperAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });

  try {
    const users = getAdminUsers();
    return NextResponse.json(users);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — create new admin user
export async function POST(request) {
  const admin = verifySuperAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });

  try {
    const data = await request.json();
    if (!data.username || !data.password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }
    const result = createAdminUser(data);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// DELETE — remove admin user
export async function DELETE(request) {
  const admin = verifySuperAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    deleteAdminUser(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
