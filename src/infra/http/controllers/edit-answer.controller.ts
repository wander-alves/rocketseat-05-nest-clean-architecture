import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer';
import { CurrentUserDecorator } from '@/infra/auth/current-user-decorator';
import type { TokenPayloadData } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
} from '@nestjs/common';
import z from 'zod/v3';

const editAnswerBodySchema = z.object({
  content: z.string(),
  attachments: z.array(z.string().uuid()),
});

type EditAnswerBodyData = z.infer<typeof editAnswerBodySchema>;

const editAnswerBodyValidationPipe = new ZodValidationPipe(
  editAnswerBodySchema,
);

@Controller('/answers/:id')
export class EditAnswerController {
  constructor(private editAnswer: EditAnswerUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(editAnswerBodyValidationPipe) body: EditAnswerBodyData,
    @CurrentUserDecorator() user: TokenPayloadData,
    @Param('id') answerId: string,
  ) {
    const { content, attachments } = body;
    const userId = user.sub;

    const result = await this.editAnswer.execute({
      answerId,
      authorId: userId,
      content,
      attachmentIds: attachments,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
