import {
  QuestionAttachment,
  type QuestionAttachmentProps,
} from '@/domain/forum/enterprise/entities/question-attachment';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export function makeQuestionAttachment(
  override?: Partial<QuestionAttachmentProps>,
  id?: string,
) {
  const questionAttachment = QuestionAttachment.create(
    {
      attachmentId: new UniqueEntityID().toString(),
      questionId: new UniqueEntityID().toString(),
      ...override,
    },
    id,
  );

  return questionAttachment;
}
