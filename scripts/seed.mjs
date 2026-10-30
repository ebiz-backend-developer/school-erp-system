import pg from 'pg'; import bcrypt from 'bcryptjs';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql:///school_erp?host=/var/run/postgresql' });
const upsertUser = async (email, pw, role, name) => {
  const hash = await bcrypt.hash(pw, 10);
  const r = await pool.query(`INSERT INTO users(email,password_hash,role,name) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO UPDATE SET password_hash=$2,role=$3,name=$4 RETURNING id`, [email, hash, role, name]);
  return r.rows[0].id;
};
const adminId = await upsertUser('admin@school.test', 'Admin123!', 'ADMIN', 'Admin');
const teacherUserId = await upsertUser('teacher@school.test', 'Teacher123!', 'TEACHER', 'Demo Teacher');
const studentUserId = await upsertUser('student@school.test', 'Student123!', 'STUDENT', 'Demo Student');
const t = await pool.query(`INSERT INTO teachers(user_id,name,email) VALUES($1,'Demo Teacher','teacher@school.test') ON CONFLICT(email) DO UPDATE SET user_id=$1 RETURNING id`, [teacherUserId]);
const s = await pool.query(`INSERT INTO students(user_id,name,email) VALUES($1,'Demo Student','student@school.test') ON CONFLICT(email) DO UPDATE SET user_id=$1 RETURNING id`, [studentUserId]);
const c = await pool.query(`INSERT INTO classes(name,teacher_id) VALUES('Math 101',$1) ON CONFLICT(name) DO UPDATE SET teacher_id=$1 RETURNING id`, [t.rows[0].id]);
await pool.query(`INSERT INTO enrollments(class_id,student_id) VALUES($1,$2) ON CONFLICT DO NOTHING`, [c.rows[0].id, s.rows[0].id]);
console.log('seeded demo accounts (see README)'); await pool.end();
