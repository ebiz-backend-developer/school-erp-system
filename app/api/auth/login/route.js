import { q } from '../../../../lib/db.js';
import { verifyPassword, signSession } from '../../../../lib/auth.js';
import { cookies } from 'next/headers';
export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  const r = await q('SELECT * FROM users WHERE email=$1', [email || '']);
  const u = r.rows[0];
  if (!u || !(await verifyPassword(password || '', u.password_hash))) return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  (await cookies()).set('session', signSession(u), { httpOnly: true, path: '/', sameSite: 'lax' });
  return Response.json({ id: u.id, email: u.email, role: u.role, name: u.name });
}
