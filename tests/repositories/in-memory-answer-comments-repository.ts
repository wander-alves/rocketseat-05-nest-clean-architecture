import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository';
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment';
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author';
import { InMemoryStudentsRepository } from 'tests/repositories/in-memory-student-repository';

export class InMemoryAnswerCommentsRepository
  implements AnswerCommentsRepository
{
  public items: AnswerComment[] = [];

  constructor(private studentsRepository: InMemoryStudentsRepository) {}

  async findById(id: string) {
    const answerComment = this.items.find((item) => item.id.toString() === id);

    if (!answerComment) {
      return null;
    }

    return answerComment;
  }

  async findManyByAnswerId(answerId: string, { page }: PaginationParams) {
    const answerComments = this.items
      .filter((item) => item.answerId === answerId)
      .slice((page - 1) * 20, page * 20);

    return answerComments;
  }

  async findManyByAnswerIdWithAuthor(
    answerId: string,
    { page }: PaginationParams,
  ) {
    const answerComments = this.items
      .filter((item) => item.answerId === answerId)
      .slice((page - 1) * 20, page * 20)
      .map((comment) => {
        const author = this.studentsRepository.items.find(
          (student) => student.id.toString() === comment.authorId,
        );

        if (!author) {
          throw new Error(
            `Author with ID "${comment.authorId}" does not exist`,
          );
        }

        return CommentWithAuthor.create({
          commentId: comment.id.toString(),
          content: comment.content,
          authorId: comment.authorId,
          authorName: author.name,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        });
      });

    return answerComments;
  }

  async create(answerComment: AnswerComment) {
    this.items.push(answerComment);
    DomainEvents.dispatchEventsForAggregate(answerComment.id.toString());
  }

  async delete(id: string) {
    const answerCommentIndex = this.items.findIndex(
      (item) => item.id.toString() === id,
    );

    this.items.splice(answerCommentIndex, 1);
  }
}
