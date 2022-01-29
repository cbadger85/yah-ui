import React, {
  ComponentPropsWithoutRef,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import {
  DefaultNotificationType,
  NotificationController,
  NotificationData,
} from './useCreateNotifier';
import { NotificationContext } from './NotificationContext';
import { NotificationStatus } from '.';

export interface NotificationManagerProps<
  T extends string,
  M extends Record<string, unknown>,
> extends ComponentPropsWithoutRef<'div'> {
  controller: NotificationController<T, M>;
  static?: boolean;
  children: (
    props: NotificationData<T, M> & { status: NotificationStatus },
  ) => ReactNode;
}

// TODO forward the ref and make component polymorphic
export function NotificationManager<
  T extends string = DefaultNotificationType,
  M extends Record<never, never> = Record<never, never>,
>({
  controller,
  static: isStatic,
  children,
  ...props
}: NotificationManagerProps<T, M>) {
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
    <div {...props}>
      {activeNotifications.map((notification) => (
        <NotificationContext.Provider
          key={notification.id}
          value={{
            remove: controller.remove,
            update: controller.update as NotificationController<
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
    </div>
  );
}
