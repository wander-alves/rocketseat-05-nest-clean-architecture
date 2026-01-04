import {
  AnswerAttachment,
  type AnswerAttachmentProps,
} from '@/domain/forum/enterprise/entities/answer-attachment';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

export function makeAnswerAttachment(
  override?: Partial<AnswerAttachmentProps>,
  id?: string,
) {
  const answerAttachment = AnswerAttachment.create(
    {
      attachmentId: new UniqueEntityID().toString(),
      answerId: new UniqueEntityID().toString(),
      ...override,
    },
    id,
  );

  return answerAttachment;
}

@Injectable()
export class AnswerAttachmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAnswerAttachment(
    data: Partial<AnswerAttachmentProps> = {},
  ): Promise<AnswerAttachment> {
    const answerAttachment = makeAnswerAttachment(data);

    await this.prisma.attachment.update({
      where: {
        id: answerAttachment.attachmentId,
      },
      data: {
        answerId: answerAttachment.answerId,
      },
    });

    return answerAttachment;
  }
}
