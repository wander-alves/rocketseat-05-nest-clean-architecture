import { expect, test } from 'vitest';
import { Slug } from './slug';

test('it should be able to create a new slug from text', () => {
  const slug1 = Slug.createFromText('A Common Forum Question');
  const slug2 = Slug.createFromText('Uma Questão Comum de Fórum');

  expect(slug1.value).toEqual('a-common-forum-question');
  expect(slug2.value).toEqual('uma-questao-comum-de-forum');
});
