import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details';
import { HttpAttachmentPresenter } from '@/infra/http/presenters/http-attachment-presenter';

export class HttpQuestionDetailsPresenter {
  static toHTTP(questionDetails: QuestionDetails) {
    return {
      questionId: questionDetails.questionId,
      title: questionDetails.title,
      content: questionDetails.content,
      slug: questionDetails.slug,
      bestAnswerId: questionDetails.bestAnswerId,
      attachments: questionDetails.attachments.map((attachment) =>
        HttpAttachmentPresenter.toHTTP(attachment),
      ),
      authorId: questionDetails.authorId,
      authorName: questionDetails.authorName,
      createdAt: questionDetails.createdAt,
      updatedAt: questionDetails.updatedAt,
    };
  }
}
