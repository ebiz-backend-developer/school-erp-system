import pg from 'pg'; import fs from 'fs';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql:///school_erp?host=/var/run/postgresql' });
await pool.query(fs.readFileSync(new URL('../db/migrate.sql', import.meta.url), 'utf8'));
console.log('migrated'); await pool.end();
