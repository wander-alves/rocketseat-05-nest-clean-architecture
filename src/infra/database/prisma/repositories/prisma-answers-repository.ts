import { Injectable } from '@nestjs/common';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { Answer } from '@/domain/forum/enterprise/entities/answer';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaAnswerMapper } from '@/infra/database/prisma/mappers/prisma-answer-mapper';
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository';
import { DomainEvents } from '@/core/events/domain-events';

@Injectable()
export class PrismaAnswersRepository implements AnswersRepository {
  constructor(
    private prisma: PrismaService,
    private answerAttachmentsRepository: AnswerAttachmentsRepository,
  ) {}

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

    await this.answerAttachmentsRepository.createMany(
      answer.attachments.getItems(),
    );

    DomainEvents.dispatchEventsForAggregate(answer.id.toString());
  }

  async save(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer);

    const attachmentsToUpdate = answer.attachments.getNewItems();
    const attachmentsToRemove = answer.attachments.getRemovedItems();

    await Promise.all([
      this.prisma.answer.update({
        data,
        where: {
          id: answer.id.toString(),
        },
      }),
      this.answerAttachmentsRepository.createMany(attachmentsToUpdate),
      this.answerAttachmentsRepository.deleteMany(attachmentsToRemove),
    ]);

    DomainEvents.dispatchEventsForAggregate(answer.id.toString());
  }

  async delete(id: string): Promise<void> {
    await this.prisma.answer.delete({ where: { id } });
  }
}
