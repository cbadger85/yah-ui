import React, { ReactNode, useEffect, useState } from 'react';
import { NotificationContext } from './NotificationContext';
import {
  NotificationsController,
  ActiveNotificationData,
  AdditionalNotificationProps,
} from './NotificationsManager';

export interface NotificationsContainerProps<
  T extends string,
  M extends AdditionalNotificationProps,
> {
  controller: NotificationsController<T, M>;
  static?: boolean;
  children: (props: ActiveNotificationData<T, Partial<M>>) => ReactNode;
}

export function NotificationsContainer<
  T extends string,
  M extends AdditionalNotificationProps = Record<never, never>,
>({
  controller,
  static: isStatic,
  children,
}: NotificationsContainerProps<T, M>) {
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
            update: controller.update as NotificationsController<
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
