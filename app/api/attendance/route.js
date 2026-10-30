import { q } from '../../../lib/db.js';
import { requireUser, err, studentIdForUser, teacherIdForUser } from '../../../lib/auth.js';
export async function GET(req) {
  try { const u = await requireUser(); const url = new URL(req.url); const sid = url.searchParams.get('student_id') || url.searchParams.get('studentId');
    if (u.role === 'STUDENT') { const id = await studentIdForUser(u); if (sid && Number(sid) !== id) return Response.json({ error: 'Forbidden' }, { status: 403 }); return Response.json((await q('SELECT * FROM attendance WHERE student_id=$1 ORDER BY date DESC', [id])).rows); }
    if (u.role === 'TEACHER') { const tid = await teacherIdForUser(u); return Response.json((await q('SELECT a.* FROM attendance a JOIN classes c ON c.id=a.class_id WHERE c.teacher_id=$1 ORDER BY a.date DESC', [tid])).rows); }
    return Response.json((await q('SELECT * FROM attendance ORDER BY date DESC')).rows);
  } catch (e) { return err(e); }
}
export async function POST(req) {
  try { const u = await requireUser(); if (u.role === 'STUDENT') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const b = await req.json(); const classId = b.class_id || b.classId, studentId = b.student_id || b.studentId, date = b.date, status = b.status || 'present';
    if (!classId || !studentId || !date) return Response.json({ error: 'class_id, student_id, date required' }, { status: 400 });
    if (u.role === 'TEACHER') { const tid = await teacherIdForUser(u); const c = await q('SELECT id FROM classes WHERE id=$1 AND teacher_id=$2', [classId, tid]); if (!c.rows[0]) return Response.json({ error: 'Forbidden' }, { status: 403 }); }
    const r = await q('INSERT INTO attendance(class_id,student_id,date,status) VALUES($1,$2,$3,$4) ON CONFLICT(class_id,student_id,date) DO UPDATE SET status=$4 RETURNING *', [classId, studentId, date, status]);
    return Response.json(r.rows[0], { status: 201 });
  } catch (e) { return err(e); }
}
