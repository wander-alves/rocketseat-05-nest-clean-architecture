import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaAnswerAttachmentsRepository } from '@/infra/database/prisma/repositories/prisma-answer-attachments-repository';
import { PrismaAnswerCommentsRepository } from '@/infra/database/prisma/repositories/prisma-answer-comments-repository';
import { PrismaAnswersRepository } from '@/infra/database/prisma/repositories/prisma-answers-repository';
import { PrismaQuestionAttachmentsRepository } from '@/infra/database/prisma/repositories/prisma-question-attachments-repository';
import { PrismaQuestionCommentsRepository } from '@/infra/database/prisma/repositories/prisma-question-comments-repository';
import { PrismaQuestionsRepository } from '@/infra/database/prisma/repositories/prisma-questions-repository';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    PrismaService,
    PrismaAnswerAttachmentsRepository,
    PrismaAnswerCommentsRepository,
    PrismaAnswersRepository,
    PrismaQuestionAttachmentsRepository,
    PrismaQuestionCommentsRepository,
    PrismaQuestionsRepository,
  ],
  exports: [
    PrismaService,
    PrismaAnswerAttachmentsRepository,
    PrismaAnswerCommentsRepository,
    PrismaAnswersRepository,
    PrismaQuestionAttachmentsRepository,
    PrismaQuestionCommentsRepository,
    PrismaQuestionsRepository,
  ],
})
export class DatabaseModule {}
