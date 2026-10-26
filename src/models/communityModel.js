export class CommunityModel {
  static fromPayload(payload = {}) {
    return {
      id: payload.id || null,
      ownerId: payload.owner_id || payload.ownerId || null,
      name: payload.name || payload.full_name || '',
      desc: payload.desc || payload.description || '',
      members: Number(payload.members || payload.member_count || 0),
      posts: Number(payload.posts || 0),
      followed: Boolean(payload.followed),
      pending: Boolean(payload.pending),
      notif: Boolean(payload.notif),
      category: payload.category || 'General',
      privacy: payload.privacy || 'public',
      joinApproval: Boolean(payload.join_approval ?? payload.joinApproval),
      postsEnabled: payload.posts_enabled !== false && payload.postsEnabled !== false,
      commentsEnabled: payload.comments_enabled !== false && payload.commentsEnabled !== false,
      rules: payload.rules || '',
      coverImageUrl: payload.cover_image_url || payload.coverImageUrl || '',
      count: Number(payload.count || 0),
      ico: payload.ico || '🌱',
    };
  }

  static toPayload(model = {}) {
    return {
      name: model.name || '',
      desc: model.desc || model.description || '',
      members: Number(model.members || 0),
      posts: Number(model.posts || 0),
      followed: Boolean(model.followed),
      notif: Boolean(model.notif),
      ico: model.ico || '🌱',
    };
  }
}
