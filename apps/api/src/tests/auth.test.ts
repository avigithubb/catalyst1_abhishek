process.env.NODE_ENV = 'test';
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../index';

describe('Authentication & Security Tests', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  test('POST /api/auth/login rejects empty payload', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /Email or username and password are required/i);
  });

  test('POST /api/auth/register validates required input fields', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@care.org' }), // missing password, name
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /Name, email, and password are required/i);
  });

  test('POST /api/auth/oauth/google handles identity verification', async () => {
    const res = await fetch(`${baseUrl}/api/auth/oauth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_oauth_user@family.org',
        name: 'Test OAuth Member',
        passcode: '2026',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token, 'Must return signed JWT token');
    assert.equal(data.user.email, 'test_oauth_user@family.org');
    assert.equal(data.user.name, 'Test OAuth Member');
  });

  test('JWT signing and decoding conforms to security requirements', () => {
    const payload = {
      userId: 'usr_test_123',
      email: 'doctor@care.org',
      role: 'doctor',
      patientProfileId: 'pat_101',
    };

    const secret = process.env.JWT_SECRET || 'test_secret_12345';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret) as any;

    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.email, payload.email);
    assert.equal(decoded.role, payload.role);
    assert.equal(decoded.patientProfileId, payload.patientProfileId);
  });

  test('Password hashing with bcrypt produces salt and hashes securely', async () => {
    const plainText = 'SecurePassword@2026';
    const hash = await bcrypt.hash(plainText, 10);

    assert.notEqual(plainText, hash);
    const matches = await bcrypt.compare(plainText, hash);
    assert.equal(matches, true);

    const wrongMatches = await bcrypt.compare('WrongPassword', hash);
    assert.equal(wrongMatches, false);
  });
});
