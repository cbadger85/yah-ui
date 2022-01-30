import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { NotificationContext } from './NotificationContext';
import {
  NotificationManager,
  ActiveNotificationData,
  AdditionalNotificationProps,
} from './NotificationsManager';

export interface NotificationsProviderProps<
  T extends string,
  P extends AdditionalNotificationProps,
> {
  manager: NotificationManager<T, P>;
  static?: boolean;
  children: (props: ActiveNotificationData<T, P>) => ReactNode;
}

export function NotificationsProvider<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
>({
  manager,
  static: isStatic,
  children,
}: NotificationsProviderProps<T, P>): ReactElement {
  const [activeNotifications, setActiveNotifications] = useState(
    manager.activeNotificationQueue.value,
  );

  useEffect(
    function subscribeToNotificationState() {
      const unsubscribe = manager.activeNotificationQueue.subscribe(
        setActiveNotifications,
      );

      return unsubscribe;
    },
    [manager.activeNotificationQueue],
  );

  return (
    <>
      {activeNotifications.map((notification) => (
        <NotificationContext.Provider
          key={notification.id}
          value={{
            remove: manager.remove,
            update: manager.update as NotificationManager<
              string,
              Record<never, never>
            >['update'],
            static: Boolean(isStatic),
            notification,
            status: notification.status,
          }}
        >
          {children(notification)}
        </NotificationContext.Provider>
      ))}
    </>
  );
}
