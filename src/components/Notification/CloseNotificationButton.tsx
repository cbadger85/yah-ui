import React, { forwardRef, ReactElement, Ref, useContext } from 'react';
import { InheritableElementProps } from '../../types';
import { NotificationContext } from './NotificationContext';

export type CloseNotificationButtonOwnProps = {
  ref?: Ref<HTMLButtonElement>;
};

export type CloseNotificationButtonProps = InheritableElementProps<
  'button',
  CloseNotificationButtonOwnProps
>;

export type CloseNotificationButtonComponent = (
  props: CloseNotificationButtonProps,
) => ReactElement | null;

export const CloseNotificationButton: CloseNotificationButtonComponent =
  forwardRef(function CloseNotificationButton(
    props: CloseNotificationButtonProps,
    ref: Ref<HTMLButtonElement>,
  ) {
    const { update, notification } = useContext(NotificationContext) || {};

    return (
      <button
        ref={ref}
        {...props}
        aria-label={props['aria-label'] ?? 'close notification button'}
        onClick={(e) => {
          props.onClick?.(e);
          if (notification?.id && update) {
            update({ id: notification.id, status: 'inactive' });
          }
        }}
      />
    );
  });
