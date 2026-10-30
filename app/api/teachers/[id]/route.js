import { q } from '../../../../lib/db.js';
import { requireUser, requireRole, err } from '../../../../lib/auth.js';
export async function GET(req, { params }) { try { await requireUser(); const { id } = await params; const r = await q('SELECT * FROM teachers WHERE id=$1', [id]); if (!r.rows[0]) return Response.json({ error: 'Not found' }, { status: 404 }); return Response.json(r.rows[0]); } catch (e) { return err(e); } }
export async function PUT(req, { params }) { try { const u = await requireUser(); requireRole(u, 'ADMIN'); const { id } = await params; const b = await req.json(); const r = await q('UPDATE teachers SET name=COALESCE($1,name), email=COALESCE($2,email) WHERE id=$3 RETURNING *', [b.name || null, b.email || null, id]); if (!r.rows[0]) return Response.json({ error: 'Not found' }, { status: 404 }); return Response.json(r.rows[0]); } catch (e) { return err(e); } }
export const PATCH = PUT;
export async function DELETE(req, { params }) { try { const u = await requireUser(); requireRole(u, 'ADMIN'); const { id } = await params; await q('DELETE FROM teachers WHERE id=$1', [id]); return Response.json({ ok: true }); } catch (e) { return err(e); } }
