import { Entity } from '@/core/entities/entity';

export interface QuestionAttachmentProps {
  questionId: string;
  attachmentId: string;
}

export class QuestionAttachment extends Entity<QuestionAttachmentProps> {
  get questionId() {
    return this.props.questionId;
  }

  get attachmentId() {
    return this.props.attachmentId;
  }

  static create(props: QuestionAttachmentProps, id?: string) {
    const attachment = new QuestionAttachment(props, id);

    return attachment;
  }
}
