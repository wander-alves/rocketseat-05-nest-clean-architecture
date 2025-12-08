import { Either, left, right } from '@/core/either';
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator';
import { StudentsRepository } from '@/domain/forum/application/repositories/students-repository';
import { StudentAlreadyExistsError } from '@/domain/forum/application/use-cases/errors/student-already-exists-error';
import { Student } from '@/domain/forum/enterprise/entities/student';

interface RegisterStudentUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

type RegisterStudentUseCaseResponse = Either<
  StudentAlreadyExistsError,
  {
    student: Student;
  }
>;

export class RegisterStudentUseCase {
  constructor(
    private studentsRepository: StudentsRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    password,
  }: RegisterStudentUseCaseRequest): Promise<RegisterStudentUseCaseResponse> {
    const studentWithSameEmail =
      await this.studentsRepository.findByEmail(email);

    if (studentWithSameEmail) {
      return left(new StudentAlreadyExistsError(email));
    }

    const passwordHash = await this.hashGenerator.hash(password);

    const student = Student.create({
      name,
      email,
      password: passwordHash,
    });

    await this.studentsRepository.create(student);

    return right({ student });
  }
}
