import React, { ElementType, forwardRef, ReactElement } from 'react';
import { PolymorphicComponentPropsWithRef, PolymorphicRef } from '../../types';

export type AlertOwnProps = {
  onRemove?: () => void;
};
export type AlertProps<C extends React.ElementType = 'div'> =
  PolymorphicComponentPropsWithRef<C, AlertOwnProps>;

export type AlertComponent = <C extends ElementType = 'div'>(
  props: AlertProps<C>,
) => ReactElement | null;

export const Alert: AlertComponent = forwardRef(function Alert<
  C extends ElementType = 'div',
>({ onRemove, as, ...props }: AlertProps<C>, ref: PolymorphicRef<C>) {
  const Component = as || 'div';

  return (
    <Component
      {...props}
      ref={ref}
      role={props.role ?? 'alert'}
      aria-live={props['aria-live'] ?? 'polite'}
    />
  );
});
