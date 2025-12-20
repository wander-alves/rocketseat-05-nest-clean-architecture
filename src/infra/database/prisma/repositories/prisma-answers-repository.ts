import { Injectable } from '@nestjs/common';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { Answer } from '@/domain/forum/enterprise/entities/answer';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaAnswerMapper } from '@/infra/database/prisma/mappers/prisma-answer-mapper';

@Injectable()
export class PrismaAnswersRepository implements AnswersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Answer | null> {
    const answer = await this.prisma.answer.findUnique({ where: { id } });

    if (!answer) {
      return null;
    }

    return PrismaAnswerMapper.toDomain(answer);
  }

  async findManyByQuestionId(
    questionId: string,
    { page }: PaginationParams,
  ): Promise<Answer[]> {
    const perPage = 20;
    const answers = await this.prisma.answer.findMany({
      where: {
        questionId,
      },
      take: perPage,
      skip: (page - 1) * perPage,
    });

    return answers.map((answer) => PrismaAnswerMapper.toDomain(answer));
  }

  async create(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer);

    await this.prisma.answer.create({
      data,
    });
  }

  async save(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer);

    await this.prisma.answer.update({
      data,
      where: {
        id: answer.id.toString(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.answer.delete({ where: { id } });
  }
}
