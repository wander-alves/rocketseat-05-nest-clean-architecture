import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug';
import { HTTPQuestionPresenter } from '@/infra/http/presenters/http-question-presenter';
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';

@Controller('/questions/:slug')
export class GetQuestionBySlugController {
  constructor(private getQuestionBySlug: GetQuestionBySlugUseCase) {}

  @Get()
  async handle(@Param('slug') slug: string) {
    const response = await this.getQuestionBySlug.execute({ slug });

    if (response.isLeft()) {
      throw new BadRequestException();
    }

    return {
      question: HTTPQuestionPresenter.toHTTP(response.value.question),
    };
  }
}
