import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmail, isValidPasscode, isPasswordStrong } from '../validators';
import { formatDate, getTodayDateString } from '../formatters';

describe('Shared Validators', () => {
  test('isValidEmail accepts valid email formats', () => {
    assert.equal(isValidEmail('caregiver@family.org'), true);
    assert.equal(isValidEmail('doctor.miller@hospital.com'), true);
    assert.equal(isValidEmail('patient+care@domain.co.uk'), true);
  });

  test('isValidEmail rejects malformed emails', () => {
    assert.equal(isValidEmail('invalid-email'), false);
    assert.equal(isValidEmail('@nodomain.com'), false);
    assert.equal(isValidEmail('spaces in@email.com'), false);
    assert.equal(isValidEmail(''), false);
  });

  test('isValidPasscode validates 4 to 8 digit pins', () => {
    assert.equal(isValidPasscode('2026'), true);
    assert.equal(isValidPasscode('12345678'), true);
    assert.equal(isValidPasscode('123'), false); // too short
    assert.equal(isValidPasscode('123456789'), false); // too long
    assert.equal(isValidPasscode('abcd'), false); // non-numeric
  });

  test('isPasswordStrong requires at least 6 characters', () => {
    assert.equal(isPasswordStrong('pass12'), true);
    assert.equal(isPasswordStrong('password123'), true);
    assert.equal(isPasswordStrong('12345'), false);
    assert.equal(isPasswordStrong(''), false);
  });
});

describe('Shared Formatters', () => {
  test('formatDate outputs readable human format', () => {
    const formatted = formatDate('2026-11-15');
    assert.match(formatted, /Nov 15, 2026/);
  });

  test('getTodayDateString returns YYYY-MM-DD pattern', () => {
    const today = getTodayDateString();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
  });
});
