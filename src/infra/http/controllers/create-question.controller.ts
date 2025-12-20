import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import z from 'zod/v3';

import { CurrentUserDecorator } from '@/infra/auth/current-user-decorator';
import type { TokenPayloadData } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question';

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

type CreateQuestionBodyData = z.infer<typeof createQuestionBodySchema>;

const createQuestionBodyValidationPipe = new ZodValidationPipe(
  createQuestionBodySchema,
);

@Controller('/questions')
export class CreateQuestionController {
  constructor(private createQuestion: CreateQuestionUseCase) {}

  @Post()
  async handle(
    @Body(createQuestionBodyValidationPipe) body: CreateQuestionBodyData,
    @CurrentUserDecorator() user: TokenPayloadData,
  ) {
    const { title, content } = body;

    const userId = user.sub;

    const result = await this.createQuestion.execute({
      title,
      content,
      authorId: userId,
      attachmentIds: [],
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
