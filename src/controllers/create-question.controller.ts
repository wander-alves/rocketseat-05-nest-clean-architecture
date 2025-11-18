import { Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUserDecorator } from 'src/auth/current-user-decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { TokenPayloadData } from 'src/auth/jwt.strategy';

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor() {}

  @Post()
  async execute(@CurrentUserDecorator() user: TokenPayloadData) {
    console.log(user);

    return 'ok';
  }
}
