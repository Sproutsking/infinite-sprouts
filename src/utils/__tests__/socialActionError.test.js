import test from 'node:test';
import assert from 'node:assert/strict';
import { socialActionError } from '../socialActionError.js';

test('identifies missing social database functions', () => {
  const message = socialActionError({ code: 'PGRST202' }, 'create this community');

  assert.match(message, /required Supabase function/);
  assert.match(message, /social\/community actions migration/);
});

test('identifies incomplete social database schema', () => {
  const message = socialActionError({ code: '42703' }, 'publish this post');

  assert.match(message, /database schema/);
  assert.match(message, /social\/community actions migration/);
});

test('preserves backend permission details', () => {
  const message = socialActionError({ code: '42501', message: 'new row violates row-level security policy' }, 'publish this post');

  assert.match(message, /Supabase denied publish this post/);
  assert.match(message, /row-level security/);
});

test('falls back to the backend message or a useful action message', () => {
  assert.equal(socialActionError({ message: 'Connection refused' }, 'create this community'), 'Connection refused');
  assert.match(socialActionError({}, 'create this community'), /Unable to create this community/);
});
