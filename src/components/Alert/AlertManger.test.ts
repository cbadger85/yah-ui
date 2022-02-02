import { resetIds } from '../../hooks';
import { createAlertManager, AlertData } from './AlertManager';

beforeEach(() => {
  resetIds();
});

describe('AlertManager', () => {
  describe('add', () => {
    it('should add an alert to the active alert queue', () => {
      const { add, getAlerts } = createAlertManager();

      const alert: Omit<AlertData, 'id'> = {
        type: 'info',
        message: 'This is a test message',
      };

      const alertId = add(alert);

      expect(getAlerts()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...alert,
            id: alertId,
            status: 'active',
          }),
        ]),
      );
    });

    it('should add an alert with the default delay', () => {
      const manager = createAlertManager();

      const alert: Omit<AlertData, 'id'> = {
        type: 'info',
        message: 'This is a test message',
      };

      manager.add(alert);

      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            delay: 6000,
          }),
        ]),
      );
    });

    it('should use the delay from the config if available', () => {
      const delay = 8000;
      const manager = createAlertManager({ delay });

      const alert: Omit<AlertData, 'id'> = {
        type: 'info',
        message: 'This is a test message',
      };

      manager.add(alert);

      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            delay,
          }),
        ]),
      );
    });

    it('should override the config delay if a message provides a delay', () => {
      const manager = createAlertManager({ delay: 8000 });

      const alert: Omit<AlertData, 'id'> = {
        type: 'info',
        message: 'This is a test message',
        delay: 10000,
      };

      manager.add(alert);

      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            delay: alert.delay,
          }),
        ]),
      );
    });

    it('should only add alerts up to the default limit', () => {
      const manager = createAlertManager();

      const alert1: Omit<AlertData, 'id'> = {
        type: 'info',
        message: 'This is test message 1',
      };

      manager.add(alert1);

      const alert2: Omit<AlertData, 'id'> = {
        type: 'info',
        message: 'This is test message 2',
      };

      manager.add(alert2);

      const alert3: Omit<AlertData, 'id'> = {
        type: 'info',
        message: 'This is test message 3',
      };

      manager.add(alert3);

      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...alert1,
            status: 'active',
          }),
        ]),
      );

      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...alert2,
            status: 'active',
          }),
        ]),
      );
      expect(manager.getAlerts()).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...alert3,
            status: 'active',
          }),
        ]),
      );
    });

    it('should allow you to add alerts up to the configured limit', () => {
      const manager = createAlertManager({ limit: 1 });

      const alert1: Omit<AlertData, 'id'> = {
        type: 'info',
        message: 'This is test message 1',
      };

      manager.add(alert1);

      const alert2: Omit<AlertData, 'id'> = {
        type: 'info',
        message: 'This is test message 2',
      };

      manager.add(alert2);

      const alert3: Omit<AlertData, 'id'> = {
        type: 'info',
        message: 'This is test message 3',
      };

      manager.add(alert3);

      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...alert1,
            status: 'active',
          }),
        ]),
      );

      expect(manager.getAlerts()).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...alert2,
            status: 'active',
          }),
        ]),
      );
      expect(manager.getAlerts()).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...alert3,
            status: 'active',
          }),
        ]),
      );
    });
  });

  describe('remove', () => {
    it('should remove the alert if it is in the active queue', () => {
      const manager = createAlertManager();

      const alert1Id = manager.add({
        type: 'info',
        message: 'Test Message 1',
      });
      const alert2Id = manager.add({
        type: 'info',
        message: 'Test Message 2',
      });

      expect(manager.getAlerts()).toHaveLength(2);
      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: alert1Id }),
          expect.objectContaining({ id: alert2Id }),
        ]),
      );

      manager.remove(alert1Id);

      expect(manager.getAlerts()).toHaveLength(1);
      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: alert2Id })]),
      );
    });

    it('should move a pending alert into the active queue after an active alert is removed', () => {
      const manager = createAlertManager({ limit: 1 });

      const alert1Id = manager.add({
        type: 'info',
        message: 'Test Message 1',
      });

      const alert2Id = manager.add({
        type: 'info',
        message: 'Test Message 2',
      });

      expect(manager.getAlerts()).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: alert2Id })]),
      );

      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: alert1Id })]),
      );

      manager.remove(alert1Id);

      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: alert2Id })]),
      );

      expect(manager.getAlerts()).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: alert1Id })]),
      );
    });

    it('should do nothing when removing a pending alert', () => {
      const manager = createAlertManager({ limit: 1 });

      const alert1Id = manager.add({
        type: 'info',
        message: 'Test Message 1',
      });

      const alert2Id = manager.add({
        type: 'info',
        message: 'Test Message 2',
      });

      expect(manager.getAlerts()).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: alert2Id })]),
      );

      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: alert1Id })]),
      );

      manager.remove(alert2Id);

      expect(manager.getAlerts()).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: alert2Id })]),
      );

      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: alert1Id })]),
      );
    });
  });
});
