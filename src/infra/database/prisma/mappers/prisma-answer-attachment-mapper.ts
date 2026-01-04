import { Prisma, Attachment as PrismaAnswerAttachment } from '@prisma/client';
import { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment';

export class PrismaAnswerAttachmentMapper {
  static toDomain(raw: PrismaAnswerAttachment): AnswerAttachment {
    if (!raw.answerId) {
      throw new Error('Invalid attachment type.');
    }

    return AnswerAttachment.create(
      {
        answerId: raw.answerId,
        attachmentId: raw.id,
      },
      raw.id,
    );
  }

  static toPrismaUpdateMany(
    attachments: AnswerAttachment[],
  ): Prisma.AttachmentUpdateManyArgs {
    const attachmentIds = attachments.map((attachment) =>
      attachment.attachmentId.toString(),
    );

    return {
      where: {
        id: {
          in: attachmentIds,
        },
      },
      data: {
        answerId: attachments[0].answerId,
      },
    };
  }
}
