import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification';
import { InMemoryNotificationsRepository } from 'tests/repositories/in-memory-notifications-repository';
import { describe, it, expect, beforeEach } from 'vitest';

let inMemoryNotificationsRepository: InMemoryNotificationsRepository;
let sut: SendNotificationUseCase;

describe('Send Notifications', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository();
    sut = new SendNotificationUseCase(inMemoryNotificationsRepository);
  });

  it('should be able to send a notification', async () => {
    const result = await sut.execute({
      recipientId: '1',
      title: 'New notification',
      content: 'new notification received',
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryNotificationsRepository.items[0]).toEqual(
      result.value?.notification,
    );
  });
});
