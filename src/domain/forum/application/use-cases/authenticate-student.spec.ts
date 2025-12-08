import { AuthenticateStudentUseCase } from '@/domain/forum/application/use-cases/authenticate-student';
import { FakeEncrypter } from 'tests/cryptography/fake-encrypter';
import { FakeHasher } from 'tests/cryptography/fake-hasher';
import { makeStudent } from 'tests/factories/make-student';
import { InMemoryStudentsRepository } from 'tests/repositories/in-memory-student-repository';
import { describe, it, expect, beforeEach } from 'vitest';

let inMemoryStudentsRepository: InMemoryStudentsRepository;
let fakeHasher: FakeHasher;
let encrypter: FakeEncrypter;
let sut: AuthenticateStudentUseCase;

describe('Authenticate Student', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository();
    fakeHasher = new FakeHasher();
    encrypter = new FakeEncrypter();
    sut = new AuthenticateStudentUseCase(
      inMemoryStudentsRepository,
      fakeHasher,
      encrypter,
    );
  });

  it('should be able to authenticate a student', async () => {
    const student = makeStudent({
      email: 'john.doe@example.com',
      password: await fakeHasher.hash('strongpassword'),
    });

    inMemoryStudentsRepository.items.push(student);

    const result = await sut.execute({
      email: 'john.doe@example.com',
      password: 'strongpassword',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    });
  });
});
