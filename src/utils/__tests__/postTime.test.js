import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPostTime } from '../postTime.js';

const now = new Date('2026-10-26T12:00:00.000Z').getTime();

test('formats recent post times under 24 hours', () => {
  assert.equal(formatPostTime(new Date(now - 20_000), now), 'Just now');
  assert.equal(formatPostTime(new Date(now - 45 * 60_000), now), '45m ago');
  assert.equal(formatPostTime(new Date(now - 5 * 60 * 60_000), now), '5h ago');
});

test('uses Yesterday for posts from the previous day and dates for older posts', () => {
  assert.equal(formatPostTime(new Date(now - 30 * 60 * 60_000), now), 'Yesterday');
  assert.equal(formatPostTime('2026-10-17T12:00:00.000Z', now), '17/10/2026');
});

test('uses a useful label for missing or invalid post timestamps', () => {
  assert.equal(formatPostTime(null, now), 'Just now');
  assert.equal(formatPostTime('not-a-date', now), 'Just now');
});
