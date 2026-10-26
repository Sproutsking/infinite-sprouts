import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultUsername, isValidUsername, normalizeUsername } from '../username.js';

test('normalizes a username and accepts the displayed @ prefix', () => {
  assert.equal(normalizeUsername(' @Farmer_One '), 'farmer_one');
  assert.equal(isValidUsername(normalizeUsername('@Farmer_One')), true);
});

test('validates username length and allowed characters', () => {
  assert.equal(isValidUsername('ab'), false);
  assert.equal(isValidUsername('farmer-name'), false);
  assert.equal(isValidUsername('member'), false);
  assert.equal(isValidUsername('farmer_1'), true);
  assert.equal(isValidUsername('a'.repeat(33)), false);
});

test('creates a stable username with a user-specific suffix', () => {
  assert.equal(
    createDefaultUsername('Emmy Strange', '12345678-1234-1234-1234-123456789012'),
    'emmy_stran_12345678123412341234',
  );
});

test('uses the email name when a useful display name is unavailable', () => {
  assert.equal(
    createDefaultUsername('Farm User', '12345678-1234-1234-1234-123456789012', 'Harvest.Fan@example.com'),
    'harvest_fa_12345678123412341234',
  );
});
