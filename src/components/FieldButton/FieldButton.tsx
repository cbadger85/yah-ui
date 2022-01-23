import { ComponentPropsWithRef, forwardRef, useContext } from 'react';
import { BaseFieldComponentProps } from '../../types';
import { mergeAttributes } from '../../utils';
import { FieldContext } from '../Field';

export type FieldButtonProps = ComponentPropsWithRef<'button'> &
  BaseFieldComponentProps;

export const FieldButton = forwardRef(function FieldButton(
  { invalid, describedBy, ...props }: FieldButtonProps,
  ref: ComponentPropsWithRef<'button'>['ref'],
) {
  const [state] = useContext(FieldContext);

  const inputProps: ComponentPropsWithRef<'button'> = {
    ...props,
    id: props.id ?? state.field.id,
    ['aria-describedby']: mergeAttributes(
      describedBy,
      props['aria-describedby'],
      ...state.validationMessages.map(({ id }) => id),
    ),
    ['aria-invalid']: props['aria-invalid'] ?? invalid,
  };

  return <button ref={ref} {...inputProps} />;
});
