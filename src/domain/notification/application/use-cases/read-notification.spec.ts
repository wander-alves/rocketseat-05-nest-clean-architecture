import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ReadNotificationUseCase } from '@/domain/notification/application/use-cases/read-notification';
import { makeNotification } from 'tests/factories/make-notification';
import { InMemoryNotificationsRepository } from 'tests/repositories/in-memory-notifications-repository';
import { describe, it, expect, beforeEach } from 'vitest';

let inMemoryNotificationsRepository: InMemoryNotificationsRepository;
let sut: ReadNotificationUseCase;

describe('Read Notification', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository();
    sut = new ReadNotificationUseCase(inMemoryNotificationsRepository);
  });

  it('should be able to read a notification', async () => {
    const newNotification = makeNotification({
      recipientId: 'recipient-1',
    });

    inMemoryNotificationsRepository.create(newNotification);

    const result = await sut.execute({
      recipientId: 'recipient-1',
      notificationId: newNotification.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryNotificationsRepository.items[0].readAt).toEqual(
      expect.any(Date),
    );
  });
  it('should not be able to read a notification from another recipient', async () => {
    const newNotification = makeNotification({
      recipientId: 'recipient-1',
    });

    inMemoryNotificationsRepository.create(newNotification);

    const result = await sut.execute({
      recipientId: 'recipient-2',
      notificationId: newNotification.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
