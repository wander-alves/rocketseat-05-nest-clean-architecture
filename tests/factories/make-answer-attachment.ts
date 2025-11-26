import {
  AnswerAttachment,
  type AnswerAttachmentProps,
} from '@/domain/forum/enterprise/entities/answer-attachment';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export function makeAnswerAttachment(
  override?: Partial<AnswerAttachmentProps>,
  id?: string,
) {
  const answerAttachment = AnswerAttachment.create(
    {
      attachmentId: new UniqueEntityID().toString(),
      answerId: new UniqueEntityID().toString(),
      ...override,
    },
    id,
  );

  return answerAttachment;
}
