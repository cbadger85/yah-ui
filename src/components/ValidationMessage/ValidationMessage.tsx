import React, {
  ComponentPropsWithRef,
  ElementType,
  forwardRef,
  useContext,
  useEffect,
} from 'react';
import { useGenerateUniqueId } from '../../hooks';
import { PolymorphicProps } from '../../types';
import { noop } from '../../utils';
import { FieldContext } from '../Field';

export interface ValidationMessageOwnProps<E extends ElementType = 'span'> {
  as?: E;
}

export type ValidationMessageProps<E extends ElementType = 'span'> =
  PolymorphicProps<E, ValidationMessageOwnProps<E>>;

export const ValidationMessage = forwardRef(function ValidationMessage<
  E extends ElementType = 'span',
>(
  { as, ...props }: ValidationMessageProps<E>,
  ref: ComponentPropsWithRef<E>['ref'],
) {
  const [_, { registerValidationMessage, removeValidationMessage }] =
    useContext(FieldContext);

  const generatedId = useGenerateUniqueId('validation-message');
  const id = props?.id || generatedId;

  useEffect(() => {
    if (id === generatedId) {
      registerValidationMessage({ id });

      return () => removeValidationMessage(id);
    } else {
      return noop;
    }
  }, [generatedId, id, registerValidationMessage, removeValidationMessage]);

  const Component = as || 'span';

  const componentProps = {
    ...props,
    id,
    ['aria-live']: props['aria-live'] ?? 'polite',
  } as ComponentPropsWithRef<E>;

  return <Component ref={ref} {...componentProps} />;
  // The implicit return type is a little complicated to understand, so this
  // fuction is typed with a more open, but easier to understand type.
}) as <E extends ElementType = 'span'>(
  props: ValidationMessageProps<E>,
) => JSX.Element;
