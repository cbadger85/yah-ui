import { resetIds } from '../../hooks';
import {
  createNotificationManager,
  NotificationData,
} from './NotificationsManager';

beforeEach(() => {
  resetIds();
});

describe('NotificationManager', () => {
  describe('add', () => {
    it('should add a notification to the active notification queue', () => {
      const { add, activeNotificationQueue } = createNotificationManager();

      const notification: Omit<NotificationData, 'id'> = {
        type: 'info',
        message: 'This is a test message',
      };

      const notificationId = add(notification);

      expect(activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...notification,
            id: notificationId,
            status: 'active',
          }),
        ]),
      );
    });

    it('should add a message with the default delay', () => {
      const manager = createNotificationManager();

      const notification: Omit<NotificationData, 'id'> = {
        type: 'info',
        message: 'This is a test message',
      };

      manager.add(notification);

      expect(manager.activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            delay: 6000,
          }),
        ]),
      );
    });

    it('should use the delay from the config if available', () => {
      const delay = 8000;
      const manager = createNotificationManager({ delay });

      const notification: Omit<NotificationData, 'id'> = {
        type: 'info',
        message: 'This is a test message',
      };

      manager.add(notification);

      expect(manager.activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            delay,
          }),
        ]),
      );
    });

    it('should override the config delay if a message provides a delay', () => {
      const manager = createNotificationManager({ delay: 8000 });

      const notification: Omit<NotificationData, 'id'> = {
        type: 'info',
        message: 'This is a test message',
        delay: 10000,
      };

      manager.add(notification);

      expect(manager.activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            delay: notification.delay,
          }),
        ]),
      );
    });

    it('should only add messages up to the default limit', () => {
      const manager = createNotificationManager();

      const notification1: Omit<NotificationData, 'id'> = {
        type: 'info',
        message: 'This is test message 1',
      };

      manager.add(notification1);

      const notification2: Omit<NotificationData, 'id'> = {
        type: 'info',
        message: 'This is test message 2',
      };

      manager.add(notification2);

      const notification3: Omit<NotificationData, 'id'> = {
        type: 'info',
        message: 'This is test message 3',
      };

      manager.add(notification3);

      expect(manager.activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...notification1,
            status: 'active',
          }),
        ]),
      );

      expect(manager.activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...notification2,
            status: 'active',
          }),
        ]),
      );
      expect(manager.activeNotificationQueue.value).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...notification3,
            status: 'active',
          }),
        ]),
      );
    });

    it('should allow you to add messages up to the configured limit', () => {
      const manager = createNotificationManager({ limit: 1 });

      const notification1: Omit<NotificationData, 'id'> = {
        type: 'info',
        message: 'This is test message 1',
      };

      manager.add(notification1);

      const notification2: Omit<NotificationData, 'id'> = {
        type: 'info',
        message: 'This is test message 2',
      };

      manager.add(notification2);

      const notification3: Omit<NotificationData, 'id'> = {
        type: 'info',
        message: 'This is test message 3',
      };

      manager.add(notification3);

      expect(manager.activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...notification1,
            status: 'active',
          }),
        ]),
      );

      expect(manager.activeNotificationQueue.value).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...notification2,
            status: 'active',
          }),
        ]),
      );
      expect(manager.activeNotificationQueue.value).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...notification3,
            status: 'active',
          }),
        ]),
      );
    });
  });

  describe('remove', () => {
    it('should remove the notification if it is in the active queue', () => {
      const manager = createNotificationManager();

      const notification1Id = manager.add({
        type: 'info',
        message: 'Test Message 1',
      });
      const notification2Id = manager.add({
        type: 'info',
        message: 'Test Message 2',
      });

      expect(manager.activeNotificationQueue.value).toHaveLength(2);
      expect(manager.activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: notification1Id }),
          expect.objectContaining({ id: notification2Id }),
        ]),
      );

      manager.remove(notification1Id);

      expect(manager.activeNotificationQueue.value).toHaveLength(1);
      expect(manager.activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: notification2Id }),
        ]),
      );
    });

    it('should move a pending notification into the active queue after an active notification is removed', () => {
      const manager = createNotificationManager({ limit: 1 });

      const notification1Id = manager.add({
        type: 'info',
        message: 'Test Message 1',
      });

      const notification2Id = manager.add({
        type: 'info',
        message: 'Test Message 2',
      });

      expect(manager.activeNotificationQueue.value).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: notification2Id }),
        ]),
      );

      expect(manager.activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: notification1Id }),
        ]),
      );

      manager.remove(notification1Id);

      expect(manager.activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: notification2Id }),
        ]),
      );

      expect(manager.activeNotificationQueue.value).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: notification1Id }),
        ]),
      );
    });

    it('should do nothing when removing a pending notification', () => {
      const manager = createNotificationManager({ limit: 1 });

      const notification1Id = manager.add({
        type: 'info',
        message: 'Test Message 1',
      });

      const notification2Id = manager.add({
        type: 'info',
        message: 'Test Message 2',
      });

      expect(manager.activeNotificationQueue.value).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: notification2Id }),
        ]),
      );

      expect(manager.activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: notification1Id }),
        ]),
      );

      manager.remove(notification2Id);

      expect(manager.activeNotificationQueue.value).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: notification2Id }),
        ]),
      );

      expect(manager.activeNotificationQueue.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: notification1Id }),
        ]),
      );
    });
  });
});
