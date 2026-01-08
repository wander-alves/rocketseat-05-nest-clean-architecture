import { PaginationParams } from '@/core/repositories/pagination-params';
import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository';
import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment';
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author';
import { InMemoryStudentsRepository } from 'tests/repositories/in-memory-student-repository';

export class InMemoryQuestionCommentsRepository
  implements QuestionCommentsRepository
{
  public items: QuestionComment[] = [];

  constructor(private studentsRepository: InMemoryStudentsRepository) {}

  async findById(id: string) {
    const questionComment = this.items.find(
      (item) => item.id.toString() === id,
    );

    if (!questionComment) {
      return null;
    }

    return questionComment;
  }

  async findManyByQuestionId(questionId: string, { page }: PaginationParams) {
    const questionComments = this.items
      .filter((item) => item.questionId === questionId)
      .slice((page - 1) * 20, page * 20);

    return questionComments;
  }

  async findManyByQuestionIdWithAuthor(
    questionId: string,
    { page }: PaginationParams,
  ) {
    const questionComments = this.items
      .filter((item) => item.questionId === questionId)
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

    return questionComments;
  }

  async create(questionComment: QuestionComment) {
    this.items.push(questionComment);
  }

  async delete(id: string) {
    const questionCommentIndex = this.items.findIndex(
      (item) => item.id.toString() === id,
    );

    this.items.splice(questionCommentIndex, 1);
  }
}
