import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common';
import z from 'zod/v3';

import { CommentOnAnswerUseCase } from '@/domain/forum/application/use-cases/comment-on-answer';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { CurrentUserDecorator } from '@/infra/auth/current-user-decorator';
import type { TokenPayloadData } from '@/infra/auth/jwt.strategy';

const commentOnAnswerBodySchema = z.object({
  content: z.string(),
});

type CommentOnAnswerBodyData = z.infer<typeof commentOnAnswerBodySchema>;

const commentOnAnswerValidationPipe = new ZodValidationPipe(
  commentOnAnswerBodySchema,
);

@Controller('/answers/:answerId/comments')
export class CommentOnAnswerController {
  constructor(private commentOnAnswer: CommentOnAnswerUseCase) {}

  @Post()
  async handle(
    @Body(commentOnAnswerValidationPipe) body: CommentOnAnswerBodyData,
    @CurrentUserDecorator() user: TokenPayloadData,
    @Param('answerId') answerId: string,
  ) {
    const { content } = body;

    const userId = user.sub;

    const result = await this.commentOnAnswer.execute({
      content,
      authorId: userId,
      answerId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
