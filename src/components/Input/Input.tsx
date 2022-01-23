import { ComponentPropsWithRef, forwardRef, useContext } from 'react';
import { BaseFieldComponentProps } from '../../types';
import { mergeAttributes } from '../../utils';
import { FieldContext } from '../Field';

export type InputProps = ComponentPropsWithRef<'input'> &
  BaseFieldComponentProps;

export const Input = forwardRef(function Input(
  { invalid, describedBy, ...props }: InputProps,
  ref: ComponentPropsWithRef<'input'>['ref'],
) {
  const [state] = useContext(FieldContext);

  const inputProps: ComponentPropsWithRef<'input'> = {
    ...props,
    id: props.id ?? state.field.id,
    ['aria-describedby']: mergeAttributes(
      describedBy,
      props['aria-describedby'],
      ...state.validationMessages.map(({ id }) => id),
    ),
    ['aria-invalid']: props['aria-invalid'] ?? invalid,
  };

  return <input ref={ref} {...inputProps} />;
});
