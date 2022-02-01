import { useEffect, useRef, useState } from 'react';
import {
  AdditionalNotificationProps,
  createNotificationManager,
  NotificationData,
  NotificationManager,
  NotificationManagerConfig,
  ActiveNotificationData,
} from './NotificationsManager';

export type UseNotificationsConfig<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
> = NotificationManagerConfig & {
  mananger?: NotificationManager<T, P>;
};

export type UseNotifications<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
> = {
  notifications: ActiveNotificationData<T, P>[];
  add: (data: Omit<NotificationData<T, P>, 'id'>) => string;
  remove: (id: string) => void;
  clear: (option?: { all: boolean }) => void;
  unmount: (id: string) => void;
};

export function useNotifications<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
>(
  config?: UseNotificationsConfig<T, P>,
): Omit<NotificationManager<T, P>, 'subscribe'> {
  const manager = useRef<NotificationManager<T, P>>(
    config?.mananger
      ? config.mananger
      : createNotificationManager<T, P>(config as NotificationManagerConfig),
  ).current;

  const [notifications, setNotifications] = useState(manager.notifications);

  useEffect(
    function subscribeToNotificationState() {
      const unsubscribe = manager.subscribe(setNotifications);

      return unsubscribe;
    },
    [manager, manager.notifications],
  );

  return {
    notifications,
    add: manager.add,
    clear: manager.clear,
    remove: manager.remove,
    unmount: manager.unmount,
  };
}
