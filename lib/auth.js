import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { q } from './db.js';
const secret = () => process.env.SESSION_SECRET || 'dev-secret-change-me';
export const hashPassword = (p) => bcrypt.hash(p, 10);
export const verifyPassword = (p, h) => bcrypt.compare(p, h);
export function signSession(user) {
  const payload = Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role, name: user.name })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
export function verifySession(token) {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const exp = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) return null;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { return null; }
}
export async function currentUser() {
  const c = await cookies();
  return verifySession(c.get('session')?.value);
}
export async function requireUser() { const u = await currentUser(); if (!u) throw Object.assign(new Error('Unauthorized'), { status: 401 }); return u; }
export function requireRole(user, ...roles) { if (!roles.includes(user.role)) throw Object.assign(new Error('Forbidden'), { status: 403 }); }
export async function studentIdForUser(user) { const r = await q('SELECT id FROM students WHERE user_id=$1', [user.id]); return r.rows[0]?.id || null; }
export async function teacherIdForUser(user) { const r = await q('SELECT id FROM teachers WHERE user_id=$1', [user.id]); return r.rows[0]?.id || null; }
export function err(e) { return Response.json({ error: e.message || 'Error' }, { status: e.status || 500 }); }
