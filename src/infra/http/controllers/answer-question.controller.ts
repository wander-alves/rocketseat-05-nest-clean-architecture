import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common';
import z from 'zod/v3';

import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question';
import { CurrentUserDecorator } from '@/infra/auth/current-user-decorator';
import type { TokenPayloadData } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const answerQuestionBodySchema = z.object({
  content: z.string(),
});

type AnswerQuestionBodyData = z.infer<typeof answerQuestionBodySchema>;

const answerQuestionBodyValidationPipe = new ZodValidationPipe(
  answerQuestionBodySchema,
);

@Controller('/questions/:questionId/answers')
export class AnswerQuestionController {
  constructor(private answerQuestion: AnswerQuestionUseCase) {}

  @Post()
  async handle(
    @Body(answerQuestionBodyValidationPipe) body: AnswerQuestionBodyData,
    @CurrentUserDecorator() user: TokenPayloadData,
    @Param('questionId') questionId: string,
  ) {
    const { content } = body;

    const userId = user.sub;

    const result = await this.answerQuestion.execute({
      content,
      questionId,
      authorId: userId,
      attachmentIds: [],
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
