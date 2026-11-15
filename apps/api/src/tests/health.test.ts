process.env.NODE_ENV = 'test';
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../index';

describe('API Health & System Endpoints', () => {
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

  test('GET / returns operational metadata and registered endpoints', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.status, 'online');
    assert.equal(data.service, 'ElderCare Connect Backend API');
    assert.equal(data.version, '1.0.0');
    assert.ok(Array.isArray(data.endpoints));
    assert.ok(data.endpoints.includes('/api/auth'));
    assert.ok(data.endpoints.includes('/api/chatbot'));
    assert.ok(data.endpoints.includes('/api/medications'));
    assert.ok(data.endpoints.includes('/api/exercises'));
  });

  test('GET /api/health returns PostgreSQL engine status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.status, 'online');
    assert.equal(data.service, 'ElderCare Connect Backend API');
    assert.equal(data.database, 'PostgreSQL ACID Engine');
    assert.ok(data.timestamp);
  });
});
