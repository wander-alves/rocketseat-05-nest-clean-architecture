import { DomainEvents } from '@/core/events/domain-events';
import { EventHandler } from '@/core/events/event-handler';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { AnswerCommentEvent } from '@/domain/forum/enterprise/events/answer-comment-event';

import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification';

export class OnAnswerComment implements EventHandler {
  constructor(
    private answersRepository: AnswersRepository,
    private questionsRepository: QuestionsRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.sendNewAnswerNotification.bind(this),
      AnswerCommentEvent.name,
    );
  }

  private async sendNewAnswerNotification({
    answerComment,
  }: AnswerCommentEvent) {
    const answer = await this.answersRepository.findById(
      answerComment.answerId.toString(),
    );
    const question = await this.questionsRepository.findById(
      answer!.questionId.toString(),
    );

    if (answer) {
      await this.sendNotification.execute({
        recipientId: answer.authorId.toString(),
        title: `Novo comentário na resposta da pergunta "${question!.title.substring(0, 40).concat('...')}"`,
        content: answerComment.content.substring(0, 40),
      });
    }
  }
}
