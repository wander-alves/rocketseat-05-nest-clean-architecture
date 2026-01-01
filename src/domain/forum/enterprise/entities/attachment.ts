import { Entity } from '@/core/entities/entity';

export interface AttachmentProps {
  title: string;
  url: string;
}

export class Attachment extends Entity<AttachmentProps> {
  get title() {
    return this.props.title;
  }

  get url() {
    return this.props.url;
  }

  static create(props: AttachmentProps, id?: string) {
    const attachment = new Attachment(props, id);

    return attachment;
  }
}
