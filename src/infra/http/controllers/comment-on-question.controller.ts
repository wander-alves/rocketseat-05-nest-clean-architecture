import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common';
import z from 'zod/v3';

import { CommentOnQuestionUseCase } from '@/domain/forum/application/use-cases/comment-on-question';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { CurrentUserDecorator } from '@/infra/auth/current-user-decorator';
import type { TokenPayloadData } from '@/infra/auth/jwt.strategy';

const commentOnQuestionBodySchema = z.object({
  content: z.string(),
});

type CommentOnQuestionBodyData = z.infer<typeof commentOnQuestionBodySchema>;

const commentOnQuestionValidationPipe = new ZodValidationPipe(
  commentOnQuestionBodySchema,
);

@Controller('/questions/:questionId/comments')
export class CommentOnQuestionController {
  constructor(private commentOnQuestion: CommentOnQuestionUseCase) {}

  @Post()
  async handle(
    @Body(commentOnQuestionValidationPipe) body: CommentOnQuestionBodyData,
    @CurrentUserDecorator() user: TokenPayloadData,
    @Param('questionId') questionId: string,
  ) {
    const { content } = body;

    const userId = user.sub;

    const result = await this.commentOnQuestion.execute({
      content,
      authorId: userId,
      questionId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
