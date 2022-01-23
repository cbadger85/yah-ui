import React, { ComponentPropsWithRef, forwardRef } from 'react';
import { FieldButton, FieldButtonProps } from '../FieldControl';

export interface ToggleProps extends ComponentPropsWithRef<'button'> {
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
  invalid?: boolean;
  describedBy?: string;
}

export const Toggle = forwardRef(function Toggle(
  { checked, onToggle, ...props }: ToggleProps,
  ref: ComponentPropsWithRef<'button'>['ref'],
) {
  const buttonProps: FieldButtonProps = {
    ...props,
    ['aria-checked']: checked ?? !!props['aria-checked'],
    onClick(e) {
      props.onClick?.(e);
      onToggle?.(!checked);
    },
  };

  return <FieldButton ref={ref} {...buttonProps} />;
});
