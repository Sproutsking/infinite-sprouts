export class CommunityModel {
  static fromPayload(payload = {}) {
    return {
      id: payload.id || null,
      name: payload.name || payload.full_name || '',
      description: payload.description || payload.desc || '',
      members: Number(payload.members || payload.member_count || 0),
      posts: Number(payload.posts || 0),
      followed: Boolean(payload.followed),
      notif: Boolean(payload.notif),
      count: Number(payload.count || 0),
      ico: payload.ico || '🌱',
    };
  }

  static toPayload(model = {}) {
    return {
      name: model.name || '',
      description: model.description || '',
      members: Number(model.members || 0),
      posts: Number(model.posts || 0),
      followed: Boolean(model.followed),
      notif: Boolean(model.notif),
      count: Number(model.count || 0),
      ico: model.ico || '🌱',
    };
  }
}
