import {
  Question as PrismaQuestion,
  User as PrismaUser,
  Attachment as PrismaAtachment,
} from '@prisma/client';

import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details';
import { PrismaAttachmentMapper } from '@/infra/database/prisma/mappers/prisma-attachment-mapper';

type PrismaQuestionDetailsProps = PrismaQuestion & {
  author: PrismaUser;
  attachments: PrismaAtachment[];
};

export class PrismaQuestionDetailsMapper {
  static toDomain(raw: PrismaQuestionDetailsProps): QuestionDetails {
    return QuestionDetails.create({
      questionId: raw.id,
      title: raw.title,
      content: raw.content,
      slug: raw.slug,
      bestAnswerId: raw.bestAnswerId,
      attachments: raw.attachments.map((attachment) =>
        PrismaAttachmentMapper.toDomain(attachment),
      ),
      authorId: raw.author.id,
      authorName: raw.author.name,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
