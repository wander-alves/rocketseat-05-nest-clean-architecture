import { Either, left, right } from '@/core/either';
import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

interface DeleteQuestionCommentRequest {
  authorId: string;
  questionCommentId: string;
}
type DeleteQuestionCommentResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {}
>;

export class DeleteQuestionComment {
  constructor(private questionCommentsRepository: QuestionCommentsRepository) {}

  async execute({
    authorId,
    questionCommentId,
  }: DeleteQuestionCommentRequest): Promise<DeleteQuestionCommentResponse> {
    const questionComment =
      await this.questionCommentsRepository.findById(questionCommentId);

    if (!questionComment) {
      return left(new ResourceNotFoundError());
    }

    if (questionComment.authorId !== authorId) {
      return left(new NotAllowedError());
    }

    await this.questionCommentsRepository.delete(questionCommentId);

    return right({});
  }
}
