import React, { forwardRef, ReactElement, Ref, useContext } from 'react';
import { InheritableElementProps } from '../../types';
import { FieldContext } from '../Field';

export type LabelOwnProps = {
  ref?: Ref<HTMLLabelElement>;
};

export type LabelProps = InheritableElementProps<'label', LabelOwnProps>;

export type LabelComponent = (props: LabelProps) => ReactElement | null;

export const Label: LabelComponent = forwardRef(function Label(
  props: LabelProps,
  ref: Ref<HTMLLabelElement>,
) {
  const [state] = useContext(FieldContext);

  /**
   *  The control will be a sibling/child of the label, with accessible
   *  identifiers passed through context.
   */
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  return (
    <label
      ref={ref}
      {...props}
      id={props.id ?? state.label.id}
      htmlFor={props.htmlFor ?? state.fieldControl.id}
    />
  );
});
