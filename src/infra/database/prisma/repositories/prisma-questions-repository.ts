import { Injectable } from '@nestjs/common';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { Question } from '@/domain/forum/enterprise/entities/question';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaQuestionMapper } from '@/infra/database/prisma/mappers/prisma-question-mapper';
import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository';

@Injectable()
export class PrismaQuestionsRepository implements QuestionsRepository {
  constructor(
    private prisma: PrismaService,
    private questionAttachmentsRepository: QuestionAttachmentsRepository,
  ) {}

  async findById(id: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });
    if (!question) {
      return null;
    }

    return PrismaQuestionMapper.toDomain(question);
  }

  async findBySlug(slug: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: { slug },
    });
    if (!question) {
      return null;
    }

    return PrismaQuestionMapper.toDomain(question);
  }

  async findManyRecent({ page }: PaginationParams): Promise<Question[]> {
    const perPage = 20;
    const questions = await this.prisma.question.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: perPage,
      skip: (page - 1) * perPage,
    });

    return questions.map((question) => PrismaQuestionMapper.toDomain(question));
  }

  async create(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question);

    await this.prisma.question.create({
      data,
    });

    await this.questionAttachmentsRepository.createMany(
      question.attachments.getItems(),
    );
  }

  async save(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question);

    const attachmentsToUpdate = question.attachments.getNewItems();
    const removedItems = question.attachments.getRemovedItems();
    const attachmentsToRemove = removedItems.filter(
      (attachment) =>
        !attachmentsToUpdate.some(
          (item) => item.attachmentId === attachment.attachmentId,
        ),
    );

    await Promise.all([
      this.prisma.question.update({
        data,
        where: {
          id: question.id.toString(),
        },
      }),
      this.questionAttachmentsRepository.createMany(attachmentsToUpdate),
      this.questionAttachmentsRepository.deleteMany(attachmentsToRemove),
    ]);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.question.delete({ where: { id } });
  }
}
