import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import z from 'zod/v3';

import { PrismaService } from '@/prisma/prisma.service';
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe';

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>;

@Controller('/accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBodySchema) {
    const { name, email, password } = body;

    const alreadyRegisteredAccount = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (alreadyRegisteredAccount) {
      throw new ConflictException(
        'User with same e-mail address already exists.',
      );
    }

    const passwordHash = await hash(password, 8);

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });
  }
}
