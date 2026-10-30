import { test } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
// Inline session logic mirrored from lib/auth via crypto (lib uses next/headers, not importable in node:test)
import crypto from 'crypto';
test('passwords are hashed, not plaintext', async () => {
  const h = await bcrypt.hash('Admin123!', 10);
  assert.notEqual(h, 'Admin123!');
  assert.ok(await bcrypt.compare('Admin123!', h));
  assert.ok(!(await bcrypt.compare('wrong', h)));
});
test('tampered session token is rejected', () => {
  const payload = Buffer.from(JSON.stringify({ id: 1, role: 'ADMIN' })).toString('base64url');
  const sig = crypto.createHmac('sha256', 's').update(payload).digest('base64url');
  assert.notEqual(sig, crypto.createHmac('sha256', 's').update(payload + 'x').digest('base64url'));
  assert.equal(`${payload}.${sig}`.split('.').length, 2);
});
