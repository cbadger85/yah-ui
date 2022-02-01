import React, { ElementType, forwardRef, ReactElement } from 'react';
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
    { onRemove, as, ...props }: NotificationProps<C>,
    ref: PolymorphicRef<C>,
  ) {
    const Component = as || 'div';

    return (
      <Component
        {...props}
        ref={ref}
        role={props.role ?? 'alert'}
        aria-live={props['aria-live'] ?? 'polite'}
      />
    );
  },
);
