import { q } from '../../../../lib/db.js';
import { requireUser, requireRole, err, studentIdForUser, teacherIdForUser } from '../../../../lib/auth.js';
async function canView(u, id) {
  if (u.role === 'ADMIN') return true;
  if (u.role === 'STUDENT') return (await studentIdForUser(u)) === Number(id);
  const tid = await teacherIdForUser(u); const r = await q('SELECT 1 FROM enrollments e JOIN classes c ON c.id=e.class_id WHERE e.student_id=$1 AND c.teacher_id=$2', [id, tid]); return r.rowCount > 0;
}
export async function GET(req, { params }) {
  try { const u = await requireUser(); const { id } = await params; if (!(await canView(u, id))) return Response.json({ error: 'Forbidden' }, { status: 403 }); const r = await q('SELECT * FROM students WHERE id=$1', [id]); if (!r.rows[0]) return Response.json({ error: 'Not found' }, { status: 404 }); return Response.json(r.rows[0]); } catch (e) { return err(e); }
}
export async function PUT(req, { params }) {
  try { const u = await requireUser(); requireRole(u, 'ADMIN'); const { id } = await params; const b = await req.json(); const r = await q('UPDATE students SET name=COALESCE($1,name), email=COALESCE($2,email) WHERE id=$3 RETURNING *', [b.name || null, b.email || null, id]); if (!r.rows[0]) return Response.json({ error: 'Not found' }, { status: 404 }); return Response.json(r.rows[0]); } catch (e) { return err(e); }
}
export const PATCH = PUT;
export async function DELETE(req, { params }) {
  try { const u = await requireUser(); requireRole(u, 'ADMIN'); const { id } = await params; await q('DELETE FROM students WHERE id=$1', [id]); return Response.json({ ok: true }); } catch (e) { return err(e); }
}
