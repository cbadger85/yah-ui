import React, { ReactNode, useEffect, useState } from 'react';
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
  controller: NotificationManager<T, P>;
  static?: boolean;
  children: (props: ActiveNotificationData<T, P>) => ReactNode;
}

export function NotificationsProvider<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
>({
  controller,
  static: isStatic,
  children,
}: NotificationsProviderProps<T, P>) {
  const [activeNotifications, setActiveNotifications] = useState(
    controller.activeNotificationQueue.value,
  );

  useEffect(
    function subscribeToNotificationState() {
      const unsubscribe = controller.activeNotificationQueue.subscribe(
        setActiveNotifications,
      );

      return unsubscribe;
    },
    [controller.activeNotificationQueue],
  );

  return (
    <>
      {activeNotifications.map((notification) => (
        <NotificationContext.Provider
          key={notification.id}
          value={{
            remove: controller.remove,
            update: controller.update as NotificationManager<
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
