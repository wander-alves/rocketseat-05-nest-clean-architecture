import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  Param,
} from '@nestjs/common';

import { DeleteAnswerUseCase } from '@/domain/forum/application/use-cases/delete-answer';
import { CurrentUserDecorator } from '@/infra/auth/current-user-decorator';
import type { TokenPayloadData } from '@/infra/auth/jwt.strategy';

@Controller('/answers/:id')
export class DeleteAnswerController {
  constructor(private deleteAnswer: DeleteAnswerUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @CurrentUserDecorator() user: TokenPayloadData,
    @Param('id') answerId: string,
  ) {
    const userId = user.sub;
    const result = await this.deleteAnswer.execute({
      answerId,
      authorId: userId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
