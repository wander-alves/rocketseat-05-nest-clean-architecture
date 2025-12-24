import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { AnswerAttachmentList } from '@/domain/forum/enterprise/entities/answer-attachment-list';
import { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment';
import { Answer } from '@/domain/forum/enterprise/entities/answer';

interface EditAnswerUseCaseRequest {
  answerId: string;
  authorId: string;
  content: string;
  attachmentIds: string[];
}

type EditAnswerUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    answer: Answer;
  }
>;

@Injectable()
export class EditAnswerUseCase {
  constructor(
    private answersRepository: AnswersRepository,
    private answerAttachmentsRepository: AnswerAttachmentsRepository,
  ) {}

  async execute({
    answerId,
    authorId,
    content,
    attachmentIds,
  }: EditAnswerUseCaseRequest): Promise<EditAnswerUseCaseResponse> {
    const answer = await this.answersRepository.findById(answerId);

    if (!answer) {
      return left(new ResourceNotFoundError());
    }

    if (answer.authorId !== authorId) {
      return left(new NotAllowedError());
    }

    const currentAnswerAttachments =
      await this.answerAttachmentsRepository.findManyByAnswerId(answerId);

    const answerAttachmentList = new AnswerAttachmentList(
      currentAnswerAttachments,
    );

    const answerAttachments = attachmentIds.map((attachmentId) => {
      return AnswerAttachment.create({
        answerId,
        attachmentId,
      });
    });

    answerAttachmentList.update(answerAttachments);

    answer.content = content;
    answer.attachments = answerAttachmentList;

    await this.answersRepository.save(answer);

    return right({
      answer,
    });
  }
}
