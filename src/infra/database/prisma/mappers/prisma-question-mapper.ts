import { Prisma, Question as PrismaQuestion } from '@prisma/client';
import { Question } from '@/domain/forum/enterprise/entities/question';

export class PrismaQuestionMapper {
  static toDomain(raw: PrismaQuestion): Question {
    return Question.create(
      {
        title: raw.title,
        content: raw.content,
        authorId: raw.authorId,
        bestAnswerId: raw.bestAnswerId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(question: Question): Prisma.QuestionUncheckedCreateInput {
    return {
      id: question.id.toString(),
      title: question.title,
      content: question.content,
      authorId: question.authorId,
      bestAnswerId: question.bestAnswerId,
      slug: question.slug.value,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }
}
