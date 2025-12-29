import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod/v3';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions';
import { HTTPQuestionPresenter } from '@/infra/http/presenters/http-question-presenter';

const pageQueryParamSchema = z.coerce.number().min(1).optional().default(1);

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller('/questions')
export class FetchRecentQuestionsController {
  constructor(private fetchRecentQuestions: FetchRecentQuestionsUseCase) {}

  @Get()
  async handle(@Query('page', queryValidationPipe) page: PageQueryParamSchema) {
    const result = await this.fetchRecentQuestions.execute({ page });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const { questions } = result.value;

    return {
      questions: questions.map((question) =>
        HTTPQuestionPresenter.toHTTP(question),
      ),
    };
  }
}
