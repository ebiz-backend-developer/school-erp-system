import { requireUser, err } from '../../../lib/auth.js';
export async function GET() { try { return Response.json(await requireUser()); } catch (e) { return err(e); } }
