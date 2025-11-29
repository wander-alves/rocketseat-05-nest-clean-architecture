import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUserDecorator } from '@/infra/auth/current-user-decorator';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import type { TokenPayloadData } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import z from 'zod/v3';

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
  constructor(private prisma: PrismaService) {}

  @Post()
  async execute(
    @Body(createQuestionBodyValidationPipe) body: CreateQuestionBodyData,
    @CurrentUserDecorator() user: TokenPayloadData,
  ) {
    const { title, content } = body;

    const userId = user.sub;

    const slug = this.convertTitleToSlug(title);

    await this.prisma.question.create({
      data: {
        authorId: userId,
        title,
        content,
        slug,
      },
    });
  }

  private convertTitleToSlug(title: string): string {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    return slug;
  }
}
