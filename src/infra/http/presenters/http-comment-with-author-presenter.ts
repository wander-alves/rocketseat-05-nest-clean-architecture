import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author';

export class HttpCommentWithAuthorPresenter {
  static toHttp(commentWithAuthor: CommentWithAuthor) {
    return {
      commentId: commentWithAuthor.commentId,
      content: commentWithAuthor.content,
      authorId: commentWithAuthor.authorId,
      authorName: commentWithAuthor.authorName,
      createdAt: commentWithAuthor.createdAt,
      updatedAt: commentWithAuthor.updatedAt,
    };
  }
}
