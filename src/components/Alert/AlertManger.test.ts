import { resetIds } from '../../hooks';
import { createAlertManager, AlertData } from './AlertManager';
import * as commonUtils from '../../utils/common';

beforeEach(() => {
  resetIds();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('AlertManager', () => {
  describe('add', () => {
    it('should add an alert to the active alert queue', () => {
      const { add, getAlerts } = createAlertManager();

      const alert: Omit<AlertData, 'id'> = {
        message: 'This is a test message',
      };

      const alertId = add(alert);

      expect(getAlerts()).toHaveLength(1);
      expect(getAlerts()).toContainEqual(
        expect.objectContaining({
          ...alert,
          id: alertId,
          status: 'active',
        }),
      );
    });

    it('should remove the alert after the duration timer is up', () => {
      jest.useFakeTimers();

      const { add, getAlerts } = createAlertManager();

      const alert: Omit<AlertData, 'id'> = {
        message: 'This is a test message',
      };

      add(alert);

      expect(getAlerts()).toHaveLength(1);

      jest.runAllTimers();

      expect(getAlerts()).toHaveLength(0);
    });

    it('should set the alert to inactive after the duration timer is up if config.static is true', () => {
      jest.useFakeTimers();

      const { add, getAlerts } = createAlertManager({ static: true });

      const alert: Omit<AlertData, 'id'> = {
        message: 'This is a test message',
      };

      const alertId = add(alert);

      expect(getAlerts()).toHaveLength(1);

      jest.runAllTimers();

      expect(getAlerts()).toHaveLength(1);
      expect(getAlerts()).toContainEqual(
        expect.objectContaining({ id: alertId, status: 'inactive' }),
      );
    });

    it('should add an alert with the default duration', () => {
      const manager = createAlertManager();

      const alert: Omit<AlertData, 'id'> = {
        message: 'This is a test message',
      };

      manager.add(alert);

      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({
          duration: 6000,
        }),
      );
    });

    it('should use the duration from the config if available', () => {
      const duration = 8000;
      const manager = createAlertManager({ duration });

      const alert: Omit<AlertData, 'id'> = {
        message: 'This is a test message',
      };

      manager.add(alert);

      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({
          duration,
        }),
      );
    });

    it('should override the config duration if a message provides a duration', () => {
      const manager = createAlertManager({ duration: 8000 });

      const alert: Omit<AlertData, 'id'> = {
        message: 'This is a test message',
        duration: 10000,
      };

      manager.add(alert);

      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({
          duration: alert.duration,
        }),
      );
    });

    it('should display the alert indefinitely if duration is set to null in the config', () => {
      jest.useFakeTimers();

      const manager = createAlertManager({ duration: null });

      const alert: Omit<AlertData, 'id'> = {
        message: 'This is a test message',
      };

      const alertId = manager.add(alert);

      jest.runAllTimers();

      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({
          id: alertId,
          duration: null,
          status: 'active',
        }),
      );
    });

    it('should display the alert indefinitely if duration is set to null message', () => {
      jest.useFakeTimers();

      const manager = createAlertManager({ duration: 10000 });

      const alert: Omit<AlertData, 'id'> = {
        message: 'This is a test message',
        duration: null,
      };

      const alertId = manager.add(alert);

      jest.runAllTimers();

      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({
          id: alertId,
          duration: null,
          status: 'active',
        }),
      );
    });

    it('should only add alerts up to the default limit', () => {
      const manager = createAlertManager();

      const alert1: Omit<AlertData, 'id'> = {
        message: 'This is test message 1',
      };

      manager.add(alert1);

      const alert2: Omit<AlertData, 'id'> = {
        message: 'This is test message 2',
      };

      manager.add(alert2);

      const alert3: Omit<AlertData, 'id'> = {
        message: 'This is test message 3',
      };

      manager.add(alert3);

      expect(manager.getAlerts()).toHaveLength(2);

      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...alert1,
            status: 'active',
          }),
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
        message: 'This is test message 1',
      };

      manager.add(alert1);

      const alert2: Omit<AlertData, 'id'> = {
        message: 'This is test message 2',
      };

      manager.add(alert2);

      const alert3: Omit<AlertData, 'id'> = {
        message: 'This is test message 3',
      };

      manager.add(alert3);

      expect(manager.getAlerts()).toHaveLength(1);

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

    it('should warn the user when adding the message if config.duration is set to Infinity', () => {
      jest.spyOn(commonUtils, 'warning');

      const manager = createAlertManager({ duration: Infinity });

      manager.add({ message: 'Test Message' });

      expect(commonUtils.warning).toBeCalledWith(false, expect.any(String));
    });

    it('should warn the user when adding the message if alert.duration is set to Infinity', () => {
      jest.spyOn(commonUtils, 'warning');

      const manager = createAlertManager();

      manager.add({ message: 'Test Message', duration: Infinity });

      expect(commonUtils.warning).toBeCalledWith(false, expect.any(String));
    });
  });

  describe('clear', () => {
    it('should clear the pending queue by default', async () => {
      jest.useFakeTimers();

      const manager = createAlertManager({ limit: 1 });

      const alert1: Omit<AlertData, 'id'> = {
        message: 'This is test message 1',
      };

      manager.add(alert1);

      const alert2: Omit<AlertData, 'id'> = {
        message: 'This is test message 2',
      };

      manager.add(alert2);

      expect(manager.getAlerts()).toHaveLength(1);

      manager.clear();

      expect(manager.getAlerts()).toHaveLength(1);

      jest.runAllTimers();

      expect(manager.getAlerts()).toHaveLength(0);
    });

    it('should clear all queues if the `all` option is provided', async () => {
      jest.useFakeTimers();

      const manager = createAlertManager({ limit: 1 });

      const alert1: Omit<AlertData, 'id'> = {
        message: 'This is test message 1',
      };

      manager.add(alert1);

      const alert2: Omit<AlertData, 'id'> = {
        message: 'This is test message 2',
      };

      manager.add(alert2);

      expect(manager.getAlerts()).toHaveLength(1);

      manager.clear({ all: true });

      expect(manager.getAlerts()).toHaveLength(0);
    });
  });

  describe('configure', () => {
    it('should update the config', () => {
      jest.useFakeTimers();

      const manager = createAlertManager();

      const alert1: Omit<AlertData, 'id'> = {
        message: 'This is test message 1',
      };
      const alert2: Omit<AlertData, 'id'> = {
        message: 'This is test message 2',
      };

      const alert1Id = manager.add(alert1);
      const alert2Id = manager.add(alert2);

      manager.configure({ limit: 3, duration: 3000, static: true });

      const alert3: Omit<AlertData, 'id'> = {
        message: 'This is test message 3',
      };

      const alert3Id = manager.add(alert3);

      expect(manager.getAlerts()).toHaveLength(3);

      jest.advanceTimersByTime(3000);

      expect(manager.getAlerts()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ...alert1,
            id: alert1Id,
            status: 'active',
            duration: 6000,
          }),
          expect.objectContaining({
            ...alert2,
            id: alert2Id,
            status: 'active',
            duration: 6000,
          }),
          expect.objectContaining({
            ...alert3,
            id: alert3Id,
            status: 'inactive',
            duration: 3000,
          }),
        ]),
      );
    });

    it('should only update the provided fields', () => {
      jest.useFakeTimers();

      const manager = createAlertManager({
        static: true,
        duration: 3000,
        limit: 1,
      });

      const alert1: Omit<AlertData, 'id'> = {
        message: 'This is test message 1',
      };

      const alert1Id = manager.add(alert1);

      manager.configure({ duration: 4000 });

      const alert2: Omit<AlertData, 'id'> = {
        message: 'This is test message 2',
      };

      const alert2Id = manager.add(alert2);

      expect(manager.getAlerts()).toEqual([
        expect.objectContaining({
          ...alert1,
          id: alert1Id,
          status: 'active',
          duration: 3000,
        }),
      ]);

      jest.advanceTimersToNextTimer();

      expect(manager.getAlerts()).toEqual([
        expect.objectContaining({
          ...alert1,
          id: alert1Id,
          status: 'inactive',
          duration: 3000,
        }),
      ]);

      manager.unmount(alert1Id);

      expect(manager.getAlerts()).toEqual([
        expect.objectContaining({
          ...alert2,
          id: alert2Id,
          status: 'active',
          duration: 4000,
        }),
      ]);

      jest.advanceTimersToNextTimer();

      expect(manager.getAlerts()).toEqual([
        expect.objectContaining({
          ...alert2,
          id: alert2Id,
          status: 'inactive',
          duration: 4000,
        }),
      ]);
    });
  });

  describe('getAlerts', () => {
    it('should return a list of active alerts', () => {
      jest.useFakeTimers();

      const manager = createAlertManager({ limit: 1 });

      const alert1: Omit<AlertData, 'id'> = {
        message: 'This is test message 1',
      };

      manager.add(alert1);

      const alert2: Omit<AlertData, 'id'> = {
        message: 'This is test message 2',
      };

      manager.add(alert2);

      expect(manager.getAlerts()).toHaveLength(1);
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ ...alert1, status: 'active' }),
      );

      jest.runOnlyPendingTimers();

      expect(manager.getAlerts()).toHaveLength(1);
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ ...alert2, status: 'active' }),
      );
    });
  });

  describe('remove', () => {
    it('should remove the alert if it is in the active queue', () => {
      const manager = createAlertManager();

      const alert1Id = manager.add({
        message: 'Test Message 1',
      });
      const alert2Id = manager.add({
        message: 'Test Message 2',
      });

      expect(manager.getAlerts()).toHaveLength(2);
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ id: alert1Id }),
      );
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ id: alert2Id }),
      );

      manager.remove(alert1Id);

      expect(manager.getAlerts()).toHaveLength(1);
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ id: alert2Id }),
      );
    });

    it('should set the alert to inactive if config.static is true', () => {
      const manager = createAlertManager({ static: true, limit: 1 });

      const alert1Id = manager.add({
        message: 'Test Message 1',
      });

      expect(manager.getAlerts()).toHaveLength(1);
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ id: alert1Id, status: 'active' }),
      );

      manager.remove(alert1Id);

      expect(manager.getAlerts()).toHaveLength(1);
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ id: alert1Id, status: 'inactive' }),
      );
    });

    it('should move a pending alert into the active queue after an active alert is removed', () => {
      const manager = createAlertManager({ limit: 1 });

      const alert1Id = manager.add({
        message: 'Test Message 1',
      });

      const alert2Id = manager.add({
        message: 'Test Message 2',
      });

      expect(manager.getAlerts()).toHaveLength(1);
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ id: alert1Id }),
      );

      manager.remove(alert1Id);

      expect(manager.getAlerts()).toHaveLength(1);
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ id: alert2Id }),
      );
    });

    it('should not add a pending alert to the active queue when a static alert is removed', () => {
      const manager = createAlertManager({ limit: 1, static: true });

      const alert1Id = manager.add({
        message: 'Test Message 1',
      });

      manager.add({
        message: 'Test Message 2',
      });

      expect(manager.getAlerts()).toHaveLength(1);
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ id: alert1Id, status: 'active' }),
      );

      manager.remove(alert1Id);

      expect(manager.getAlerts()).toHaveLength(1);
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ id: alert1Id, status: 'inactive' }),
      );
    });

    it('should remove a pending alert', () => {
      jest.useFakeTimers();

      const manager = createAlertManager({ limit: 1 });

      const alert1Id = manager.add({
        message: 'Test Message 1',
      });

      const alert2Id = manager.add({
        message: 'Test Message 2',
      });

      expect(manager.getAlerts()).toHaveLength(1);
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ id: alert1Id }),
      );

      manager.remove(alert2Id);

      jest.runAllTimers();

      expect(manager.getAlerts()).toHaveLength(0);
    });
  });

  describe('subscribe', () => {
    it('should call the listener with the active notification list when it changes', () => {
      const duration = 5000;
      const manager = createAlertManager({ limit: 1, duration: duration });

      const listener = jest.fn();

      manager.subscribe(listener);

      const alert: Omit<AlertData, 'id'> = {
        message: 'This is test message 1',
      };

      manager.add(alert);

      expect(listener).toBeCalledWith([
        {
          id: expect.any(String),
          message: alert.message,
          duration,
          pause: expect.any(Function),
          resume: expect.any(Function),
          close: expect.any(Function),
          isPaused: false,
          status: 'active',
        },
      ]);
    });
  });

  describe('unmount', () => {
    it('should remove the active alert from the list', () => {
      const manager = createAlertManager();

      const listener = jest.fn();

      manager.subscribe(listener);

      const alert: Omit<AlertData, 'id'> = {
        message: 'This is test message 1',
      };

      const alertId = manager.add(alert);

      expect(manager.getAlerts()).toHaveLength(1);

      manager.unmount(alertId);

      expect(manager.getAlerts()).toHaveLength(0);
    });

    it('should not remove the alert from the pending queue', () => {
      jest.useFakeTimers();

      const manager = createAlertManager({ limit: 1 });

      const listener = jest.fn();

      manager.subscribe(listener);

      const alert1: Omit<AlertData, 'id'> = {
        message: 'This is test message 1',
      };

      manager.add(alert1);

      const alert2: Omit<AlertData, 'id'> = {
        message: 'This is test message 2',
      };

      const alertId2 = manager.add(alert2);

      expect(manager.getAlerts()).toHaveLength(1);

      manager.unmount(alertId2);

      jest.runOnlyPendingTimers();

      expect(manager.getAlerts()).toHaveLength(1);
      expect(manager.getAlerts()).toContainEqual(
        expect.objectContaining({ id: alertId2 }),
      );
    });
  });
});
