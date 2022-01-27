import React, { ComponentPropsWithRef, forwardRef, useContext } from 'react';
import { FieldContext } from '../Field';

export type LabelProps = ComponentPropsWithRef<'label'>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  props: LabelProps,
  ref: ComponentPropsWithRef<'label'>['ref'],
) {
  const [state] = useContext(FieldContext);

  const labelProps: ComponentPropsWithRef<'label'> = {
    ...props,
    id: props.id ?? state.label.id,
    htmlFor: props.htmlFor ?? state.fieldControl.id,
  };

  /**
   *  The control will be a sibling/child of the label, with accessible
   *  identifiers passed through context.
   */
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  return <label ref={ref} {...labelProps} />;
});
