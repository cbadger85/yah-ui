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
  Metadata extends Record<string, unknown>,
  NotificationType extends string,
> extends ComponentPropsWithoutRef<'div'> {
  controller: NotificationController<Metadata, NotificationType>;
  static?: boolean;
  children: (
    props: NotificationData<NotificationType> & { status: NotificationStatus },
  ) => ReactNode;
}

// TODO forward the ref and make component polymorphic
export function NotificationManager<
  Metadata extends Record<string, unknown>,
  NotificationType extends string = DefaultNotificationType,
>({
  controller,
  static: isStatic,
  children,
  ...props
}: NotificationManagerProps<Metadata, NotificationType>) {
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
              Record<string, unknown>,
              string
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
