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

export interface NotificationManagerProps<T extends string>
  extends ComponentPropsWithoutRef<'div'> {
  controller: NotificationController<T>;
  static?: boolean;
  children: (
    props: NotificationData<T> & { status: 'active' | 'inactive' },
  ) => ReactNode;
}

// TODO forward the ref and make component polymorphic
export function NotificationManager<
  T extends string = DefaultNotificationType,
>({
  controller,
  static: isStatic,
  children,
  ...props
}: NotificationManagerProps<T>) {
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
            update:
              controller.update as NotificationController<string>['update'],
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
