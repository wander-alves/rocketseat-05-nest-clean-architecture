import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { Question } from '@/domain/forum/enterprise/entities/question';
import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details';
import { InMemoryAttachmentsRepository } from 'tests/repositories/in-memory-attachments-repository';
import { InMemoryQuestionAttachmentsRepository } from 'tests/repositories/in-memory-question-attachments-repository';
import { InMemoryStudentsRepository } from 'tests/repositories/in-memory-student-repository';

export class InMemoryQuestionsRepository implements QuestionsRepository {
  public items: Question[] = [];

  constructor(
    private questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository,
    private studentsRepository: InMemoryStudentsRepository,
    private attachmentsRepository: InMemoryAttachmentsRepository,
  ) {}

  async findById(id: string) {
    const question = this.items.find(
      (question) => question.id.toString() === id,
    );

    if (!question) {
      return null;
    }

    return question;
  }

  async findBySlug(slug: string) {
    const question = this.items.find((item) => item.slug.value === slug);

    if (!question) {
      return null;
    }

    return question;
  }

  async findDetailsBySlug(slug: string) {
    const question = this.items.find((item) => item.slug.value === slug);

    if (!question) {
      return null;
    }

    const author = this.studentsRepository.items.find(
      (student) => student.id.toString() === question.authorId,
    );

    if (!author) {
      throw new Error(`Author with ID "${question.authorId}" does not exists.`);
    }

    const questionAttachments = this.questionAttachmentsRepository.items.filter(
      (questionAttachment) =>
        questionAttachment.questionId === question.id.toString(),
    );

    const attachments = questionAttachments.map((questionAttachment) => {
      const attachment = this.attachmentsRepository.items.find(
        (item) => item.id.toString() === questionAttachment.attachmentId,
      );
      if (!attachment) {
        throw new Error(
          `Attachment with ID "${questionAttachment.attachmentId}" does not exists.`,
        );
      }
      return attachment;
    });

    return QuestionDetails.create({
      questionId: question.id.toString(),
      content: question.content,
      title: question.title,
      slug: question.slug.value,
      bestAnswserId: question.bestAnswerId,
      authorId: author.id.toString(),
      authorName: author.name,
      attachments,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    });
  }

  async findManyRecent({ page }: PaginationParams) {
    const questions = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20);

    return questions;
  }

  async create(question: Question) {
    this.items.push(question);

    await this.questionAttachmentsRepository.createMany(
      question.attachments.getItems(),
    );

    DomainEvents.dispatchEventsForAggregate(question.id.toString());
  }

  async save(question: Question) {
    const questionIndex = this.items.findIndex(
      (item) => item.id === question.id,
    );

    await this.questionAttachmentsRepository.createMany(
      question.attachments.getNewItems(),
    );

    await this.questionAttachmentsRepository.deleteMany(
      question.attachments.getRemovedItems(),
    );

    this.items[questionIndex] = question;
    DomainEvents.dispatchEventsForAggregate(question.id.toString());
  }

  async delete(id: string) {
    const questionIndex = this.items.findIndex(
      (item) => item.id.toString() === id,
    );

    this.items.splice(questionIndex, 1);

    await this.questionAttachmentsRepository.deleteManyByQuestionId(id);
  }
}
