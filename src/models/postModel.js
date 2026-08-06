export class PostModel {
  static fromPayload(payload = {}) {
    const body = (payload.body || '').replace(/#([a-zA-Z0-9_]+)/g, '').replace(/\s{2,}/g, ' ').trim();
    const tags = Array.isArray(payload.tags) ? payload.tags : [];
    const fallbackTags = (payload.body || '').match(/#([a-zA-Z0-9_]+)/g) || [];

    return {
      id: payload.id || null,
      authorId: payload.author_id || payload.authorId || payload.user_id || null,
      body,
      tags: tags.length ? tags : fallbackTags.map(tag => tag.slice(1)),
      communityId: payload.community_id || payload.communityId || null,
      likes: Number(payload.likes || 0),
      comments: Number(payload.comments || 0),
      shares: Number(payload.shares || 0),
      createdAt: payload.created_at || payload.createdAt || null,
      image: payload.image || payload.media || null,
    };
  }

  static toPayload(model = {}) {
    return {
      author_id: model.authorId || null,
      body: model.body || '',
      tags: model.tags || [],
      community_id: model.communityId || null,
      likes: Number(model.likes || 0),
      shares: Number(model.shares || 0),
      created_at: model.createdAt || new Date().toISOString(),
      image: model.image || null,
    };
  }
}
