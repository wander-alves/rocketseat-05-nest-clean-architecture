import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import z from 'zod/v3';

import { FetchQuestionAnswersUseCase } from '@/domain/forum/application/use-cases/fetch-question-answers';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { HttpAnswerPresenter } from '@/infra/http/presenters/http-answer-presenter';

const pageQueryParamSchema = z.coerce.number().min(1).optional().default(1);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

@Controller('/questions/:questionId/answers')
export class FetchQuestionAnswersController {
  constructor(private fetchQuestionAnswers: FetchQuestionAnswersUseCase) {}

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    @Param('questionId') questionId: string,
  ) {
    const response = await this.fetchQuestionAnswers.execute({
      page,
      questionId,
    });

    if (response.isLeft()) {
      throw new BadRequestException();
    }

    const { answers } = response.value;

    return {
      answers: answers.map((answer) => HttpAnswerPresenter.toHTTP(answer)),
    };
  }
}
