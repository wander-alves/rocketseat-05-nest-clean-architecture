import { Encrypter } from '@/domain/forum/application/cryptography/encrypter';
import { HashComparer } from '@/domain/forum/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator';
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher';
import { JwtEncrypter } from '@/infra/cryptography/jwt-encrypter';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: Encrypter,
      useClass: JwtEncrypter,
    },
    {
      provide: HashComparer,
      useClass: BcryptHasher,
    },
    {
      provide: HashGenerator,
      useClass: BcryptHasher,
    },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
