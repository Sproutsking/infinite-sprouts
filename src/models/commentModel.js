export class CommentModel {
  static fromPayload(payload = {}) {
    const body = payload.body || payload.content || '';
    return {
      id: payload.id || null,
      postId: payload.post_id || payload.postId || null,
      parentCommentId: payload.parent_comment_id || payload.parentCommentId || null,
      authorId: payload.author_id || payload.authorId || payload.user_id || null,
      body,
      text: body,
      createdAt: payload.created_at || payload.createdAt || null,
    };
  }

  static toPayload(model = {}) {
    return {
      post_id: model.postId || null,
      parent_comment_id: model.parentCommentId || null,
      author_id: model.authorId || null,
      body: model.body || '',
      created_at: model.createdAt || new Date().toISOString(),
    };
  }
}
