import React, {
  ElementType,
  forwardRef,
  ReactElement,
  useContext,
  useEffect,
} from 'react';
import { DEFAULT_NOTIFICATION_DELAY } from './NotificationsManager';
import { NotificationContext } from './NotificationContext';
import { PolymorphicComponentPropsWithRef, PolymorphicRef } from '../../types';

export type NotificationOwnProps = {
  onRemove?: () => void;
};
export type NotificationProps<C extends React.ElementType = 'div'> =
  PolymorphicComponentPropsWithRef<C, NotificationOwnProps>;

export type NotificationComponent = <C extends ElementType = 'div'>(
  props: NotificationProps<C>,
) => ReactElement | null;

export const Notification: NotificationComponent = forwardRef(
  function Notification<C extends ElementType = 'div'>(
    { onRemove, ...props }: NotificationProps<C>,
    ref: PolymorphicRef<C>,
  ) {
    const {
      remove,
      static: isStatic,
      notification,
      update,
      status,
    } = useContext(NotificationContext) || {};

    useEffect(
      function deactivateAfterDelay() {
        const timer = setTimeout(() => {
          if (notification?.id) {
            update?.({ id: notification.id, status: 'inactive' });
          }
        }, notification?.delay || DEFAULT_NOTIFICATION_DELAY);

        return function cleanup() {
          clearTimeout(timer);
        };
      },
      [notification?.delay, notification?.id, update],
    );

    useEffect(
      function removeIfInactive() {
        if (status === 'inactive') {
          onRemove?.();

          if (!isStatic && notification?.id && remove) {
            remove(notification.id);
          }
        }
      },
      [status, onRemove, isStatic, notification?.id, remove],
    );

    return (
      <div
        {...props}
        ref={ref}
        role={props.role ?? 'alert'}
        aria-live={props['aria-live'] ?? 'polite'}
      />
    );
  },
);
