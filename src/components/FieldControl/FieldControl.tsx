import {
  ComponentPropsWithRef,
  ElementType,
  forwardRef,
  useContext,
} from 'react';
import { PolymorphicProps } from '../../types';
import { mergeAttributes } from '../../utils';
import { FieldContext } from '../Field';
import React from 'react';

export interface FieldControlOwnProps {
  invalid?: boolean;
  describedBy?: string;
}

export type FieldControlProps<E extends ElementType> = PolymorphicProps<
  E,
  FieldControlOwnProps
>;

function fieldControlFactory<E extends ElementType>(as?: E) {
  return forwardRef(function FieldControl(
    { invalid, describedBy, ...props }: FieldControlProps<E>,
    ref: ComponentPropsWithRef<E>['ref'],
  ) {
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
      ['aria-invalid']: props['aria-invalid'] ?? invalid,
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
