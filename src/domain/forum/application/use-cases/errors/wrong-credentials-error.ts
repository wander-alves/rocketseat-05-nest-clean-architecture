import { UseCaseError } from '@/core/errors/use-case-error';

export class WrongCredentialsError extends Error implements UseCaseError {
  constructor() {
    super('The provided credentials are invalid.');
  }
}
