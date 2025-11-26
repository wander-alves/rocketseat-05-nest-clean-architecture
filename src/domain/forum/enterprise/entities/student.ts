import { Entity } from '@/core/entities/entity';

interface StudentProps {
  name: string;
}

export class Student extends Entity<StudentProps> {
  get name() {
    return this.props.name;
  }

  static create(props: StudentProps, id?: string) {
    const student = new Student(
      {
        ...props,
      },
      id,
    );

    return student;
  }
}
