import { faker } from '@faker-js/faker';

import {
  Notification,
  type NotificationProps,
} from '@/domain/notification/enterprise/entities/notification';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export function makeNotification(
  override?: Partial<NotificationProps>,
  id?: string,
) {
  const notification = Notification.create(
    {
      recipientId: new UniqueEntityID().toString(),
      title: faker.lorem.sentence(4),
      content: faker.lorem.sentence(10),
      ...override,
    },
    id,
  );

  return notification;
}
