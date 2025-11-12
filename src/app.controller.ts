import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('/api')
export class AppController {
  constructor(
    private appService: AppService,
    private prisma: PrismaService,
  ) {}

  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/hello')
  async store() {
    return this.prisma.user.findMany();
  }
}
