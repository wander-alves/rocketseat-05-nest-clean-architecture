import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
} from '@nestjs/common';
import z from 'zod/v3';

import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question';
import { CurrentUserDecorator } from '@/infra/auth/current-user-decorator';
import { type TokenPayloadData } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const editQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

type EditQuestionBodyData = z.infer<typeof editQuestionBodySchema>;

const editqeustionBodyValidationPipe = new ZodValidationPipe(
  editQuestionBodySchema,
);

@Controller('/questions/:id')
export class EditQuestionController {
  constructor(private editQuestion: EditQuestionUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(editqeustionBodyValidationPipe) body: EditQuestionBodyData,
    @CurrentUserDecorator() user: TokenPayloadData,
    @Param('id') questionId: string,
  ) {
    const { title, content } = body;
    const userId = user.sub;

    const result = await this.editQuestion.execute({
      title,
      content,
      authorId: userId,
      attachmentIds: [],
      questionId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
