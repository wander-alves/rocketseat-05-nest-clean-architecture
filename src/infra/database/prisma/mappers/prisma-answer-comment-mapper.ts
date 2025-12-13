import { Comment as PrismaAnswerComment, Prisma } from '@prisma/client';
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment';

export class PrismaAnswerCommentMapper {
  static toDomain(raw: PrismaAnswerComment): AnswerComment {
    if (!raw.answerId) {
      throw new Error('Invalid comment type.');
    }

    return AnswerComment.create(
      {
        content: raw.content,
        authorId: raw.authorId,
        answerId: raw.answerId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(
    answerComment: AnswerComment,
  ): Prisma.CommentUncheckedCreateInput {
    return {
      id: answerComment.id.toString(),
      content: answerComment.content,
      authorId: answerComment.authorId,
      answerId: answerComment.answerId,
      createdAt: answerComment.createdAt,
      updatedAt: answerComment.updatedAt,
    };
  }
}
