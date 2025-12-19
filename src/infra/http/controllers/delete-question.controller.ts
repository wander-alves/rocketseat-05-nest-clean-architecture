import { DeleteQuestionUseCase } from '@/domain/forum/application/use-cases/delete-question';
import { CurrentUserDecorator } from '@/infra/auth/current-user-decorator';
import { type TokenPayloadData } from '@/infra/auth/jwt.strategy';
import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  Param,
} from '@nestjs/common';

@Controller('/questions/:id')
export class DeleteQuestionController {
  constructor(private deleteQuestion: DeleteQuestionUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @CurrentUserDecorator() user: TokenPayloadData,
    @Param('id') questionId: string,
  ) {
    const userId = user.sub;
    const result = await this.deleteQuestion.execute({
      authorId: userId,
      questionId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
