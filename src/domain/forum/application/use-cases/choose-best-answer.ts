import { Either, left, right } from '@/core/either';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { Question } from '@/domain/forum/enterprise/entities/question';

interface ChooseBestAnswerUseCaseRequest {
  answerId: string;
  authorId: string;
}

type ChooseBestAnswerUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    question: Question;
  }
>;

export class ChooseBestAnswerUseCase {
  constructor(
    private questionsRepository: QuestionsRepository,
    private answersRepository: AnswersRepository,
  ) {}

  async execute({
    answerId,
    authorId,
  }: ChooseBestAnswerUseCaseRequest): Promise<ChooseBestAnswerUseCaseResponse> {
    const answer = await this.answersRepository.findById(answerId);

    if (!answer) {
      return left(new ResourceNotFoundError());
    }

    const question = await this.questionsRepository.findById(answer.questionId);

    if (!question) {
      return left(new ResourceNotFoundError());
    }

    if (question.authorId !== authorId) {
      return left(new NotAllowedError());
    }

    question.bestAnswerId = answer.id.toString();

    await this.questionsRepository.save(question);

    return right({
      question,
    });
  }
}
