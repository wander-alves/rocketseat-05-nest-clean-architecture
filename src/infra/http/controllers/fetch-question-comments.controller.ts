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
import { HttpCommentWithAuthorPresenter } from '@/infra/http/presenters/http-comment-with-author-presenter';

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
    const result = await this.fetchQuestionComments.execute({
      page,
      questionId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const { questionComments } = result.value;

    return {
      comments: questionComments.map((questionComment) =>
        HttpCommentWithAuthorPresenter.toHttp(questionComment),
      ),
    };
  }
}
