import { Entity } from '@/core/entities/entity';

export interface AnswerAttachmentProps {
  answerId: string;
  attachmentId: string;
}

export class AnswerAttachment extends Entity<AnswerAttachmentProps> {
  get answerId() {
    return this.props.answerId;
  }

  get attachmentId() {
    return this.props.attachmentId;
  }

  static create(props: AnswerAttachmentProps, id?: string) {
    const attachment = new AnswerAttachment(props, id);

    return attachment;
  }
}
