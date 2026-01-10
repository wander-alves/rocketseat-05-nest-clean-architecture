import { Injectable } from '@nestjs/common';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository';
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaAnswerCommentMapper } from '@/infra/database/prisma/mappers/prisma-answer-comment-mapper';
import { PrismaCommentWithAuthorMapper } from '@/infra/database/prisma/mappers/prisma-comment-with-author-mapper';
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author';

@Injectable()
export class PrismaAnswerCommentsRepository
  implements AnswerCommentsRepository
{
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<AnswerComment | null> {
    const answerComment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!answerComment) {
      return null;
    }

    return PrismaAnswerCommentMapper.toDomain(answerComment);
  }

  async findManyByAnswerId(
    answerId: string,
    { page }: PaginationParams,
  ): Promise<AnswerComment[]> {
    const perPage = 20;
    const answerComments = await this.prisma.comment.findMany({
      where: {
        answerId,
      },
      take: perPage,
      skip: (page - 1) * perPage,
    });

    return answerComments.map((answerComment) =>
      PrismaAnswerCommentMapper.toDomain(answerComment),
    );
  }

  async findManyByAnswerIdWithAuthor(
    answerId: string,
    { page }: PaginationParams,
  ): Promise<CommentWithAuthor[]> {
    const perPage = 20;
    const answerComments = await this.prisma.comment.findMany({
      where: {
        answerId,
      },
      include: {
        author: true,
      },
      take: perPage,
      skip: (page - 1) * perPage,
    });

    return answerComments.map((answerComment) =>
      PrismaCommentWithAuthorMapper.toDomain(answerComment),
    );
  }

  async create(answerComment: AnswerComment): Promise<void> {
    const data = PrismaAnswerCommentMapper.toPrisma(answerComment);

    await this.prisma.comment.create({ data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }
}
