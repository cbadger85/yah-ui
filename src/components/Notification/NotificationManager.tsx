import React, {
  ComponentPropsWithoutRef,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { NotificationContext } from './NotificationContext';
import {
  NotificationController,
  ActiveNotificationData,
  NotificationMetadata,
} from './useCreateNotifier';

export interface NotificationManagerProps<
  T extends string,
  M extends NotificationMetadata,
> extends ComponentPropsWithoutRef<'div'> {
  controller: NotificationController<T, M>;
  static?: boolean;
  children: (props: ActiveNotificationData<T, M>) => ReactNode;
}

// TODO forward the ref and make component polymorphic
export function NotificationManager<
  T extends string,
  M extends NotificationMetadata = Record<never, never>,
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
