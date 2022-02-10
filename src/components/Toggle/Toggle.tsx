import React, { forwardRef, ReactElement, Ref } from 'react';
import { InheritableElementProps } from '../../types';
import { FieldButton, FieldButtonProps } from '../FieldControl';

export type ToggleOwnProps = {
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
  invalid?: boolean;
  describedBy?: string;
  ref?: Ref<HTMLButtonElement>;
};

export type ToggleProps = InheritableElementProps<'button', ToggleOwnProps>;

export type ToggleComponent = (props: ToggleProps) => ReactElement | null;

export const Toggle: ToggleComponent = forwardRef<
  HTMLButtonElement,
  ToggleProps
>(function Toggle(
  { checked, onToggle, ...props }: ToggleProps,
  ref: FieldButtonProps['ref'],
) {
  return (
    <FieldButton
      ref={ref}
      {...props}
      aria-checked={checked ?? !!props['aria-checked']}
      onClick={(e) => {
        props.onClick?.(e);
        onToggle?.(!checked);
      }}
    />
  );
});
