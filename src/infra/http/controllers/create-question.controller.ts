import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUserDecorator } from '@/infra/auth/current-user-decorator';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import type { TokenPayloadData } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import z from 'zod/v3';
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
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private createQuestion: CreateQuestionUseCase) {}

  @Post()
  async execute(
    @Body(createQuestionBodyValidationPipe) body: CreateQuestionBodyData,
    @CurrentUserDecorator() user: TokenPayloadData,
  ) {
    const { title, content } = body;

    const userId = user.sub;

    await this.createQuestion.execute({
      title,
      content,
      authorId: userId,
      attachmentIds: [],
    });
  }
}
