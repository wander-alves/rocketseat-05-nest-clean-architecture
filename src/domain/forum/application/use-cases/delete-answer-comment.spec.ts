import { DeleteAnswerComment } from '@/domain/forum/application/use-cases/delete-answer-comment';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { makeAnswerComment } from 'tests/factories/make-answer-comment';
import { InMemoryAnswerCommentsRepository } from 'tests/repositories/in-memory-answer-comments-repository';
import { describe, it, expect, beforeEach } from 'vitest';

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let sut: DeleteAnswerComment;

describe('Delete Answer Comment', () => {
  beforeEach(() => {
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository();
    sut = new DeleteAnswerComment(inMemoryAnswerCommentsRepository);
  });
  it('should be able to delete a answer comment', async () => {
    const answerComment = makeAnswerComment();

    await inMemoryAnswerCommentsRepository.create(answerComment);

    await sut.execute({
      authorId: answerComment.authorId.toString(),
      answerCommentId: answerComment.id.toString(),
    });

    expect(inMemoryAnswerCommentsRepository.items).toHaveLength(0);
  });
  it('should not be able to delete another user answer comment', async () => {
    const answerComment = makeAnswerComment({ authorId: 'author-01' });

    await inMemoryAnswerCommentsRepository.create(answerComment);

    const result = await sut.execute({
      authorId: 'author-02',
      answerCommentId: answerComment.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
