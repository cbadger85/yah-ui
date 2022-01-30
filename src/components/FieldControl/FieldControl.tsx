import React, {
  ElementType,
  forwardRef,
  ReactElement,
  useContext,
} from 'react';
import { InheritableElementProps, PolymorphicRef } from '../../types';
import { mergeAttributes } from '../../utils';
import { FieldContext } from '../Field';

export interface FieldControlOwnProps {
  invalid?: boolean;
  describedBy?: string;
}

// Can't use PolymorphicComponentPropsWithRef because FieldControl does not have an `as` prop.
export type FieldControlProps<C extends ElementType> = InheritableElementProps<
  C,
  FieldControlOwnProps
> & { ref?: PolymorphicRef<C> };

export function fieldControlFactory<C extends ElementType>(as?: C) {
  return forwardRef(function FieldControl(
    { invalid, describedBy, ...props }: FieldControlProps<C>,
    ref: PolymorphicRef<C>,
  ) {
    const [state] = useContext(FieldContext);

    const Component = as || 'input';

    return (
      <Component
        {...props}
        ref={ref}
        id={props.id ?? state.fieldControl.id}
        aria-describedby={mergeAttributes(
          describedBy,
          props['aria-describedby'],
          ...state.validationMessages.map(({ id }) => id),
        )}
        aria-invalid={invalid ?? props['aria-invalid']}
      />
    );
  });
}

export type FieldButtonProps = FieldControlProps<'button'>;

export type FieldButtonComponent = (
  props: FieldControlProps<'button'>,
) => ReactElement | null;

export const FieldButton: FieldButtonComponent = fieldControlFactory('button');

export type InputProps = FieldControlProps<'input'>;

export type InputComponent = (
  props: FieldControlProps<'input'>,
) => ReactElement | null;

export const Input: InputComponent = fieldControlFactory('input');

export type SelectProps = FieldControlProps<'select'>;

export type SelectComponent = (
  props: FieldControlProps<'select'>,
) => ReactElement | null;

export const Select: SelectComponent = fieldControlFactory('select');
