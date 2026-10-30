import { q } from './db.js';
import bcrypt from 'bcryptjs';
// Shared handlers for students/teachers/classes. table is internal constant only.
// shortcut: name/email-only update, sufficient for MVP forms.
export async function createPerson(table, role, body) {
  let userId = null;
  if (body.email && body.password) {
    const hash = await bcrypt.hash(body.password, 10);
    const u = await q(`INSERT INTO users(email,password_hash,role,name) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO UPDATE SET password_hash=$2 RETURNING id`, [body.email, hash, role, body.name]);
    userId = u.rows[0].id;
  }
  const r = await q(`INSERT INTO ${table}(user_id,name,email) VALUES($1,$2,$3) RETURNING *`, [userId, body.name, body.email]);
  return r.rows[0];
}
