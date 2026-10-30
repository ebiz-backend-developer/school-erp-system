import { q } from '../../../lib/db.js';
import { requireUser, requireRole, err, studentIdForUser, teacherIdForUser } from '../../../lib/auth.js';
import { createPerson } from '../../../lib/crud.js';
export async function GET() {
  try {
    const u = await requireUser();
    if (u.role === 'ADMIN') return Response.json((await q('SELECT * FROM students ORDER BY id')).rows);
    if (u.role === 'STUDENT') { const id = await studentIdForUser(u); return Response.json((await q('SELECT * FROM students WHERE id=$1', [id])).rows); }
    const tid = await teacherIdForUser(u);
    return Response.json((await q('SELECT DISTINCT s.* FROM students s JOIN enrollments e ON e.student_id=s.id JOIN classes c ON c.id=e.class_id WHERE c.teacher_id=$1 ORDER BY s.id', [tid])).rows);
  } catch (e) { return err(e); }
}
export async function POST(req) {
  try { const u = await requireUser(); requireRole(u, 'ADMIN'); const b = await req.json(); if (!b.name || !b.email) return Response.json({ error: 'name and email required' }, { status: 400 }); return Response.json(await createPerson('students', 'STUDENT', b), { status: 201 }); } catch (e) { return err(e); }
}
