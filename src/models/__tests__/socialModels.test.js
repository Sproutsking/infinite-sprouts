import test from 'node:test';
import assert from 'node:assert/strict';
import { PostModel, CommentModel, ShareModel } from '../index.js';

test('normalizes post payloads and comment payloads', () => {
  const post = PostModel.fromPayload({
    author_id: 'user-1',
    body: 'Hello #farmers',
    tags: ['farmers'],
    community_id: 'c-1',
    likes: 2,
    shares: 1,
    created_at: '2024-01-01T00:00:00.000Z',
  });

  assert.equal(post.authorId, 'user-1');
  assert.equal(post.body, 'Hello');
  assert.deepEqual(post.tags, ['farmers']);
  assert.equal(post.communityId, 'c-1');

  const comment = CommentModel.fromPayload({
    post_id: 'post-1',
    author_id: 'user-2',
    body: 'Nice work',
  });

  assert.equal(comment.postId, 'post-1');
  assert.equal(comment.body, 'Nice work');
});

test('builds share payloads and keeps counts consistent', () => {
  const share = ShareModel.fromPayload({
    post_id: 'post-1',
    author_id: 'user-3',
    message: 'Shared for the team',
  });

  assert.equal(share.postId, 'post-1');
  assert.equal(share.message, 'Shared for the team');
  assert.ok(share.createdAt);
});
