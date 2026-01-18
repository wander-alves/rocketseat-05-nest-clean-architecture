import {
  BadRequestException,
  Controller,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import { ReadNotificationUseCase } from '@/domain/notification/application/use-cases/read-notification';
import { CurrentUserDecorator } from '@/infra/auth/current-user-decorator';
import type { TokenPayloadData } from '@/infra/auth/jwt.strategy';

@Controller('/notifications/:notificationId/read')
export class ReadNotificationController {
  constructor(private readNotification: ReadNotificationUseCase) {}

  @Patch()
  @HttpCode(204)
  async handle(
    @CurrentUserDecorator() user: TokenPayloadData,
    @Param('notificationId') notificationId: string,
  ) {
    const userId = user.sub;

    const result = await this.readNotification.execute({
      recipientId: userId,
      notificationId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
