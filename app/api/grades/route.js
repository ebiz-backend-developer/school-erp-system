import { q } from '../../../lib/db.js';
import { requireUser, err, studentIdForUser, teacherIdForUser } from '../../../lib/auth.js';
export async function GET(req) {
  try { const u = await requireUser(); const url = new URL(req.url); const sid = url.searchParams.get('student_id') || url.searchParams.get('studentId');
    if (u.role === 'STUDENT') { const id = await studentIdForUser(u); if (sid && Number(sid) !== id) return Response.json({ error: 'Forbidden' }, { status: 403 }); return Response.json((await q('SELECT * FROM grades WHERE student_id=$1 ORDER BY id', [id])).rows); }
    if (u.role === 'TEACHER') { const tid = await teacherIdForUser(u); return Response.json((await q('SELECT g.* FROM grades g JOIN classes c ON c.id=g.class_id WHERE c.teacher_id=$1 ORDER BY g.id', [tid])).rows); }
    return Response.json((await q('SELECT * FROM grades ORDER BY id')).rows);
  } catch (e) { return err(e); }
}
export async function POST(req) {
  try { const u = await requireUser(); if (u.role === 'STUDENT') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const b = await req.json(); const studentId = b.student_id || b.studentId, classId = b.class_id || b.classId || null, subject = b.subject || 'General', score = b.score ?? b.grade;
    if (!studentId || score === undefined) return Response.json({ error: 'student_id and score required' }, { status: 400 });
    if (u.role === 'TEACHER' && classId) { const tid = await teacherIdForUser(u); const c = await q('SELECT id FROM classes WHERE id=$1 AND teacher_id=$2', [classId, tid]); if (!c.rows[0]) return Response.json({ error: 'Forbidden' }, { status: 403 }); }
    const r = await q('INSERT INTO grades(student_id,class_id,subject,score) VALUES($1,$2,$3,$4) ON CONFLICT(student_id,class_id,subject) DO UPDATE SET score=$4 RETURNING *', [studentId, classId, subject, String(score)]);
    return Response.json(r.rows[0], { status: 201 });
  } catch (e) { return err(e); }
}
