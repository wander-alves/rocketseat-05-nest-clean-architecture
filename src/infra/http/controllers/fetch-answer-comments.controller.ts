import { FetchAnswerCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-answer-comments';
import z from 'zod/v3';

import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { HttpAnswerCommentPresenter } from '@/infra/http/presenters/http-answer-comment-presenter';

const pageQueryParamsSchema = z.coerce.number().min(1).optional().default(1);

type PageQueryParamsData = z.infer<typeof pageQueryParamsSchema>;

const pageQueryParamsValidationPipe = new ZodValidationPipe(
  pageQueryParamsSchema,
);

@Controller('/answers/:answerId/comments')
export class FetchAnswerCommentsController {
  constructor(private fetchAnswerComments: FetchAnswerCommentsUseCase) {}

  @Get()
  async handle(
    @Query('page', pageQueryParamsValidationPipe) page: PageQueryParamsData,
    @Param('answerId') answerId: string,
  ) {
    const response = await this.fetchAnswerComments.execute({
      answerId,
      page,
    });

    if (response.isLeft()) {
      throw new BadRequestException();
    }

    const { answerComments } = response.value;

    return {
      comments: answerComments.map((answerComment) =>
        HttpAnswerCommentPresenter.toHttp(answerComment),
      ),
    };
  }
}
