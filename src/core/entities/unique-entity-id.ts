import { randomUUID } from 'node:crypto';

export class UniqueEntityID {
  private value: string;

  constructor(value?: string) {
    this.value = value ?? randomUUID();
  }

  toValue() {
    return this.value;
  }

  toString() {
    return this.value;
  }

  equals(id: string) {
    return this.value === id;
  }
}
