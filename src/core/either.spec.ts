import { left, right } from '@/core/either';
import { describe } from 'node:test';
import { expect, it } from 'vitest';

describe('Either', () => {
  it('should return success', () => {
    const result = right('success');

    expect(result.value).toEqual('success');
    expect(result.isRight()).toEqual(true);
    expect(result.isLeft()).toEqual(false);
  });

  it('should return error', () => {
    const result = left('error');

    expect(result.value).toEqual('error');
    expect(result.isLeft()).toEqual(true);
    expect(result.isRight()).toEqual(false);
  });
});
