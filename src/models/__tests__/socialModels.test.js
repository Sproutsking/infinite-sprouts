import test from 'node:test';
import assert from 'node:assert/strict';
import { PostModel, CommentModel, ShareModel, CommunityModel } from '../index.js';

test('normalizes post payloads and comment payloads', () => {
  const post = PostModel.fromPayload({
    author_id: 'user-1',
    body: 'Hello #farmers',
    tags: ['farmers'],
    community_id: 'c-1',
    likes: 2,
    shares: 1,
    comments_enabled: false,
    location: 'Kaduna, Nigeria',
    pinned_at: '2024-01-02T00:00:00.000Z',
    created_at: '2024-01-01T00:00:00.000Z',
  });

  assert.equal(post.authorId, 'user-1');
  assert.equal(post.body, 'Hello');
  assert.deepEqual(post.tags, ['farmers']);
  assert.equal(post.communityId, 'c-1');
  assert.equal(post.commentsEnabled, false);
  assert.equal(post.location, 'Kaduna, Nigeria');
  assert.equal(PostModel.toPayload(post).comments_enabled, false);
  assert.equal(post.pinnedAt, '2024-01-02T00:00:00.000Z');

  const comment = CommentModel.fromPayload({
    post_id: 'post-1',
    author_id: 'user-2',
    body: 'Nice work',
    likes: 3,
  });

  assert.equal(comment.postId, 'post-1');
  assert.equal(comment.body, 'Nice work');
  assert.equal(comment.likes, 3);
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

test('community insert payload only includes schema columns', () => {
  const payload = CommunityModel.toPayload({ name: 'Maize growers', count: 0 });

  assert.equal(payload.name, 'Maize growers');
  assert.equal('count' in payload, false);
});

test('normalizes owner-managed community settings', () => {
  const community = CommunityModel.fromPayload({
    owner_id: 'owner-1',
    category: 'Crops',
    privacy: 'private',
    join_approval: true,
    posts_enabled: false,
    comments_enabled: false,
    rules: 'Be kind',
    image_url: 'https://example.test/community.jpg',
    cover_image_url: 'https://example.test/cover.jpg',
  });

  assert.equal(community.ownerId, 'owner-1');
  assert.equal(community.category, 'Crops');
  assert.equal(community.privacy, 'private');
  assert.equal(community.joinApproval, true);
  assert.equal(community.postsEnabled, false);
  assert.equal(community.commentsEnabled, false);
  assert.equal(community.rules, 'Be kind');
  assert.equal(community.imageUrl, 'https://example.test/community.jpg');
  assert.equal(community.coverImageUrl, 'https://example.test/cover.jpg');
});
