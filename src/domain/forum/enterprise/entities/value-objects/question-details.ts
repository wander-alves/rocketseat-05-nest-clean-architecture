import { ValueObject } from '@/core/entities/value-object';
import { Attachment } from '@/domain/forum/enterprise/entities/attachment';

export interface QuestionDetailsProps {
  questionId: string;
  title: string;
  content: string;
  slug: string;
  bestAnswserId?: string | null;
  authorId: string;
  authorName: string;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt?: Date | null;
}

export class QuestionDetails extends ValueObject<QuestionDetailsProps> {
  get questionId() {
    return this.props.questionId;
  }

  get title() {
    return this.props.title;
  }

  get content() {
    return this.props.content;
  }

  get slug() {
    return this.props.slug;
  }

  get bestAnswserId() {
    return this.props.bestAnswserId;
  }

  get authorId() {
    return this.props.authorId;
  }

  get authorName() {
    return this.props.authorName;
  }

  get attachments() {
    return this.props.attachments;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: QuestionDetailsProps) {
    return new QuestionDetails(props);
  }
}
