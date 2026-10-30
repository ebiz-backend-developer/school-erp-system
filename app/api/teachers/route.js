import { q } from '../../../lib/db.js';
import { requireUser, requireRole, err } from '../../../lib/auth.js';
import { createPerson } from '../../../lib/crud.js';
export async function GET() { try { await requireUser(); return Response.json((await q('SELECT * FROM teachers ORDER BY id')).rows); } catch (e) { return err(e); } }
export async function POST(req) { try { const u = await requireUser(); requireRole(u, 'ADMIN'); const b = await req.json(); if (!b.name || !b.email) return Response.json({ error: 'name and email required' }, { status: 400 }); return Response.json(await createPerson('teachers', 'TEACHER', b), { status: 201 }); } catch (e) { return err(e); } }
