import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment';

export class HttpQuestionCommentPresenter {
  static toHttp(questionComment: QuestionComment) {
    return {
      id: questionComment.id.toString(),
      content: questionComment.content,
      createdAt: questionComment.createdAt,
      updatedAt: questionComment.updatedAt,
    };
  }
}
