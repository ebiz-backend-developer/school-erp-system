'use client';
import { useState } from 'react';
export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [msg, setMsg] = useState('');
  async function submit(e) { e.preventDefault(); const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); if (r.ok) location.href = '/dashboard'; else setMsg('Invalid credentials'); }
  return <main><h1>School ERP Login</h1><form onSubmit={submit}><input name="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><input name="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><button>Log in</button></form><p>{msg}</p><p>Demo: admin@school.test / Admin123! · teacher@school.test / Teacher123! · student@school.test / Student123!</p></main>;
}
