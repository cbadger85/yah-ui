import React, {
  ComponentPropsWithRef,
  ElementType,
  forwardRef,
  useContext,
} from 'react';
import { PolymorphicProps } from '../../types';
import { mergeAttributes } from '../../utils';
import { FieldContext } from '../Field';

export interface FieldControlOwnProps {
  invalid?: boolean;
  describedBy?: string;
}

export type FieldControlProps<E extends ElementType> = PolymorphicProps<
  E,
  FieldControlOwnProps
>;

function fieldControlFactory<E extends ElementType>(as?: E) {
  return forwardRef<
    E extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[E] : never,
    FieldControlProps<E>
  >(function FieldControl({ invalid, describedBy, ...props }, ref) {
    const [state] = useContext(FieldContext);

    const Component = as || 'input';

    const componentProps = {
      ...props,
      id: props.id ?? state.field.id,
      ['aria-describedby']: mergeAttributes(
        describedBy,
        props['aria-describedby'],
        ...state.validationMessages.map(({ id }) => id),
      ),
      ['aria-invalid']: invalid ?? props['aria-invalid'],
    } as ComponentPropsWithRef<E>;

    return <Component ref={ref} {...componentProps} />;
  });
}

export const FieldButton = fieldControlFactory('button');
export type FieldButtonProps = FieldControlProps<'button'>;

export const Input = fieldControlFactory('input');
export type InputProps = FieldControlProps<'input'>;

export const Select = fieldControlFactory('select');
export type SelectProps = FieldControlProps<'select'>;
