import { q } from '../../../lib/db.js';
import { requireUser, requireRole, err, teacherIdForUser } from '../../../lib/auth.js';
export async function GET() {
  try { const u = await requireUser();
    if (u.role === 'TEACHER') { const tid = await teacherIdForUser(u); return Response.json((await q('SELECT * FROM classes WHERE teacher_id=$1 ORDER BY id', [tid])).rows); }
    return Response.json((await q('SELECT * FROM classes ORDER BY id')).rows);
  } catch (e) { return err(e); }
}
export async function POST(req) { try { const u = await requireUser(); requireRole(u, 'ADMIN'); const b = await req.json(); if (!b.name) return Response.json({ error: 'name required' }, { status: 400 }); const r = await q('INSERT INTO classes(name,teacher_id) VALUES($1,$2) RETURNING *', [b.name, b.teacher_id || b.teacherId || null]); return Response.json(r.rows[0], { status: 201 }); } catch (e) { return err(e); } }
