export class ShareModel {
  static fromPayload(payload = {}) {
    return {
      id: payload.id || null,
      postId: payload.post_id || payload.postId || null,
      authorId: payload.author_id || payload.authorId || payload.user_id || null,
      message: payload.message || payload.body || '',
      createdAt: payload.created_at || payload.createdAt || new Date().toISOString(),
    };
  }

  static toPayload(model = {}) {
    return {
      post_id: model.postId || null,
      author_id: model.authorId || null,
      message: model.message || '',
      created_at: model.createdAt || new Date().toISOString(),
    };
  }
}
