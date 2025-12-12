import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import z from 'zod/v3';

import { EnvService } from '@/infra/env/env.service';

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
});

export type TokenPayloadData = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: EnvService) {
    const publicKey = configService.get('JWT_PUBLIC_KEY');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    });
  }

  validate(payload: TokenPayloadData) {
    return tokenPayloadSchema.parse(payload);
  }
}
