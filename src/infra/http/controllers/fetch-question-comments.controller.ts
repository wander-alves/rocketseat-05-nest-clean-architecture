import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { z } from 'zod/v3';

import { FetchQuestionCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-question-comments';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { HttpQuestionCommentPresenter } from '@/infra/http/presenters/http-question-comment-presenter';

const pageQueryParamSchema = z.coerce.number().min(1).optional().default(1);

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

type PageQueryParamData = z.infer<typeof pageQueryParamSchema>;

@Controller('/questions/:questionId/comments')
export class FetchQuestionCommentsController {
  constructor(private fetchQuestionComments: FetchQuestionCommentsUseCase) {}

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamData,
    @Param('questionId') questionId: string,
  ) {
    const response = await this.fetchQuestionComments.execute({
      page,
      questionId,
    });

    if (response.isLeft()) {
      throw new BadRequestException();
    }

    const { questionComments } = response.value;

    return {
      comments: questionComments.map((questionComment) =>
        HttpQuestionCommentPresenter.toHttp(questionComment),
      ),
    };
  }
}
