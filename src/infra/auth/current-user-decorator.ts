import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayloadData } from '@/infra/auth/jwt.strategy';

export const CurrentUserDecorator = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.user as TokenPayloadData;
  },
);
