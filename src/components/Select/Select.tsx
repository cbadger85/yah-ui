import { ComponentPropsWithRef, forwardRef, useContext } from 'react';
import { BaseFieldComponentProps } from '../../types';
import { mergeAttributes } from '../../utils';
import { FieldContext } from '../Field';

export type SelectProps = ComponentPropsWithRef<'select'> &
  BaseFieldComponentProps;

export const Select = forwardRef(function Select(
  { invalid, describedBy, ...props }: SelectProps,
  ref: ComponentPropsWithRef<'select'>['ref'],
) {
  const [state] = useContext(FieldContext);

  const selectProps: ComponentPropsWithRef<'select'> = {
    ...props,
    id: props.id ?? state.field.id,
    ['aria-describedby']: mergeAttributes(
      describedBy,
      props['aria-describedby'],
      ...state.validationMessages.map(({ id }) => id),
    ),
    ['aria-invalid']: props['aria-invalid'] ?? invalid,
  };

  return <select ref={ref} {...selectProps} />;
});
