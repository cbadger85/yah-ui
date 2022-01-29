import React, {
  ComponentPropsWithRef,
  forwardRef,
  useContext,
  useEffect,
} from 'react';
import { DEFAULT_NOTIFICATION_DELAY } from './useCreateNotifier';
import { NotificationContext } from './NotificationContext';

export type NotificationProps = ComponentPropsWithRef<'div'> & {
  onRemove?: () => void;
};

// TODO make component polymorphic
export const Notification = forwardRef(function Notification(
  { onRemove, ...props }: NotificationProps,
  ref: ComponentPropsWithRef<'div'>['ref'],
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
});
