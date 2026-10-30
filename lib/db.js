import pg from 'pg';
const g = globalThis;
if (!g._pool) g._pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql:///school_erp?host=/var/run/postgresql' });
export const pool = g._pool;
export const q = (text, params) => pool.query(text, params);
