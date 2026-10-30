'use client';
import { useEffect, useState } from 'react';
const api = async (url, opts) => { const r = await fetch(url, opts); if (r.status === 401) { location.href = '/login'; throw new Error('unauthorized'); } return r; };
export default function Dashboard() {
  const [me, setMe] = useState(null); const [students, setStudents] = useState([]); const [teachers, setTeachers] = useState([]); const [classes, setClasses] = useState([]); const [attendance, setAttendance] = useState([]); const [grades, setGrades] = useState([]);
  const [form, setForm] = useState({}); const set = k => e => setForm({ ...form, [k]: e.target.value });
  async function load() {
    const m = await (await api('/api/me')).json(); setMe(m);
    setStudents(await (await api('/api/students')).json()); setTeachers(await (await api('/api/teachers')).json()); setClasses(await (await api('/api/classes')).json());
    setAttendance(await (await api('/api/attendance')).json()); setGrades(await (await api('/api/grades')).json());
  }
  useEffect(() => { load().catch(() => {}); }, []);
  async function act(url, method, body) { await api(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); load(); }
  if (!me) return <main>Loading…</main>;
  const isAdmin = me.role === 'ADMIN';
  return <main>
    <h1>School ERP</h1><p>{me.name} ({me.role}) — {me.email}</p>
    <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); location.href = '/login'; }}>Log out</button>

    <section><h2>Students</h2><table><tbody>{students.map(s => <tr key={s.id}><td>{s.id}</td><td>{s.name}</td><td>{s.email}</td>{isAdmin && <td><button onClick={() => act(`/api/students/${s.id}`, 'PUT', { name: form['sn' + s.id] || s.name })}>Edit</button><input placeholder="New name" onChange={set('sn' + s.id)} /><button onClick={() => act(`/api/students/${s.id}`, 'DELETE')}>Delete</button></td>}</tr>)}</tbody></table>
    {isAdmin && <form onSubmit={e => { e.preventDefault(); act('/api/students', 'POST', { name: form.sname, email: form.semail, password: form.spass }); }}><input placeholder="Student name" onChange={set('sname')} /><input placeholder="Student email" onChange={set('semail')} /><input placeholder="Password" onChange={set('spass')} /><button>Create student</button></form>}</section>

    <section><h2>Teachers</h2><table><tbody>{teachers.map(t => <tr key={t.id}><td>{t.id}</td><td>{t.name}</td><td>{t.email}</td>{isAdmin && <td><button onClick={() => act(`/api/teachers/${t.id}`, 'DELETE')}>Delete</button></td>}</tr>)}</tbody></table>
    {isAdmin && <form onSubmit={e => { e.preventDefault(); act('/api/teachers', 'POST', { name: form.tname, email: form.temail, password: form.tpass }); }}><input placeholder="Teacher name" onChange={set('tname')} /><input placeholder="Teacher email" onChange={set('temail')} /><input placeholder="Password" onChange={set('tpass')} /><button>Create teacher</button></form>}</section>

    <section><h2>Classes</h2><table><tbody>{classes.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td>teacher {c.teacher_id}</td>{isAdmin && <td><button onClick={() => act(`/api/classes/${c.id}`, 'DELETE')}>Delete</button></td>}</tr>)}</tbody></table>
    {isAdmin && <form onSubmit={e => { e.preventDefault(); act('/api/classes', 'POST', { name: form.cname, teacher_id: Number(form.cteacher) || null }); }}><input placeholder="Class name" onChange={set('cname')} /><input placeholder="Teacher id" onChange={set('cteacher')} /><button>Create class</button></form>}</section>

    {(me.role !== 'STUDENT') && <section><h2>Mark attendance</h2><form onSubmit={e => { e.preventDefault(); act('/api/attendance', 'POST', { class_id: Number(form.aclass), student_id: Number(form.astudent), date: form.adate, status: form.astatus || 'present' }); }}><input placeholder="Class id" onChange={set('aclass')} /><input placeholder="Student id" onChange={set('astudent')} /><input type="date" onChange={set('adate')} /><input placeholder="present/absent" onChange={set('astatus')} /><button>Save attendance</button></form>
    <h2>Enter grade</h2><form onSubmit={e => { e.preventDefault(); act('/api/grades', 'POST', { class_id: Number(form.gclass), student_id: Number(form.gstudent), subject: form.gsubject || 'Math', score: form.gscore }); }}><input placeholder="Class id" onChange={set('gclass')} /><input placeholder="Student id" onChange={set('gstudent')} /><input placeholder="Subject" onChange={set('gsubject')} /><input placeholder="Score/grade" onChange={set('gscore')} /><button>Save grade</button></form></section>}

    <section><h2>Attendance</h2><pre>{JSON.stringify(attendance, null, 1)}</pre><h2>Grades</h2><pre>{JSON.stringify(grades, null, 1)}</pre></section>
  </main>;
}
