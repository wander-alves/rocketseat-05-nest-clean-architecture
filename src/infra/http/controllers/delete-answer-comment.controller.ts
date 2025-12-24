import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  Param,
} from '@nestjs/common';

import { DeleteAnswerCommentUseCase } from '@/domain/forum/application/use-cases/delete-answer-comment';
import { CurrentUserDecorator } from '@/infra/auth/current-user-decorator';
import type { TokenPayloadData } from '@/infra/auth/jwt.strategy';

@Controller('/answers/comments/:id')
export class DeleteAnswerCommentController {
  constructor(private deleteAnswerComment: DeleteAnswerCommentUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @CurrentUserDecorator() user: TokenPayloadData,
    @Param('id') answerCommentId: string,
  ) {
    const userId = user.sub;

    const result = await this.deleteAnswerComment.execute({
      authorId: userId,
      answerCommentId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
