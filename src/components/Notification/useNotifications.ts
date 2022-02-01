import { ReactNode, useEffect, useRef, useState } from 'react';
import { hasProperty } from '../../utils';
import {
  ActiveNotificationData,
  createNotificationManager,
  NotificationManager,
  NotificationManagerConfig,
} from './NotificationsManager';

export type UseNotifications<M = ReactNode, T extends string = string> = Omit<
  NotificationManager<M, T>,
  'subscribe' | 'getNotifications'
> & {
  /**
   * the current list of active notifications
   */
  notifications: ActiveNotificationData<M, T>[];
};

/**
 * A React wrapper around `NotificationManager` that has already subscribed to the notifications.
 *
 * @param manager an instance of `NotificationManager` created by `createNotificationManager`
 */
export function useNotifications<M = ReactNode, T extends string = string>(
  manager: NotificationManager<M, T>,
): UseNotifications<M, T>;
/**
 * A React wrapper around `NotificationManager` that has already subscribed to the notifications.
 *
 * @param config the configuration object for the `NotificationManager`
 */
export function useNotifications<M = ReactNode, T extends string = string>(
  config?: NotificationManagerConfig,
): UseNotifications<M, T>;
export function useNotifications<M = ReactNode, T extends string = string>(
  param?: NotificationManagerConfig | NotificationManager<M, T>,
): UseNotifications<M, T> {
  const manager = useRef<NotificationManager<M, T>>(
    isNotificationManager<M, T>(param)
      ? param
      : createNotificationManager<M, T>(param),
  ).current;

  const [notifications, setNotifications] = useState(
    manager.getNotifications(),
  );

  useEffect(
    function subscribeToNotificationState() {
      const unsubscribe = manager.subscribe(setNotifications);

      return unsubscribe;
    },
    [manager, manager.getNotifications],
  );

  return {
    notifications,
    add: manager.add,
    clear: manager.clear,
    remove: manager.remove,
    unmount: manager.unmount,
  };
}

function isNotificationManager<M, T extends string>(
  notificationManger: unknown,
): notificationManger is NotificationManager<M, T> {
  return (
    hasProperty(notificationManger, 'subscribe') &&
    typeof notificationManger.subscribe === 'function' &&
    hasProperty(notificationManger, 'add') &&
    typeof notificationManger.add === 'function' &&
    hasProperty(notificationManger, 'clear') &&
    typeof notificationManger.clear === 'function' &&
    hasProperty(notificationManger, 'remove') &&
    typeof notificationManger.remove === 'function' &&
    hasProperty(notificationManger, 'unmount') &&
    typeof notificationManger.unmount === 'function' &&
    hasProperty(notificationManger, 'notifications') &&
    Array.isArray(notificationManger.notifications)
  );
}
