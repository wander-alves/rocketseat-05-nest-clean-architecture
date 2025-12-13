import { Attachment as PrismaQuestionAttachment } from '@prisma/client';
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment';

export class PrismaQuestionAttachmentMapper {
  static toDomain(raw: PrismaQuestionAttachment): QuestionAttachment {
    if (!raw.questionId) {
      throw new Error('Invalid attachment type.');
    }
    return QuestionAttachment.create(
      {
        questionId: raw.questionId,
        attachmentId: raw.id,
      },
      raw.id,
    );
  }
}
