import { Answer } from '@/domain/forum/enterprise/entities/answer';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { Either, right } from '@/core/either';
import { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment';
import { AnswerAttachmentList } from '@/domain/forum/enterprise/entities/answer-attachment-list';

interface AnswerQuestionUseCaseRequest {
  content: string;
  instructorId: string;
  questionId: string;
  attachmentIds: string[];
}

type AnswerQuestionUseCaseResponse = Either<
  null,
  {
    answer: Answer;
  }
>;

export class AnswerQuestionUseCase {
  constructor(private answersRepository: AnswersRepository) {}

  async execute({
    content,
    instructorId,
    questionId,
    attachmentIds,
  }: AnswerQuestionUseCaseRequest): Promise<AnswerQuestionUseCaseResponse> {
    const answer = Answer.create({
      content,
      authorId: instructorId,
      questionId,
    });

    const answerAttachments = attachmentIds.map((attachmentId) => {
      return AnswerAttachment.create({
        attachmentId,
        answerId: answer.id.toString(),
      });
    });

    answer.attachments = new AnswerAttachmentList(answerAttachments);

    await this.answersRepository.create(answer);

    return right({ answer });
  }
}
