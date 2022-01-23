import React, {
  ComponentPropsWithRef,
  ElementType,
  forwardRef,
  useContext,
  useEffect,
} from 'react';
import { useGenerateUniqueId } from '../../hooks';
import { PolymorphicProps } from '../../types';
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
  const [state, { registerValidationMessage, removeValidationMessage }] =
    useContext(FieldContext);

  const id = useGenerateUniqueId('validation').concat(state.baseId || '');

  useEffect(() => {
    registerValidationMessage({ id });

    return () => removeValidationMessage(id);
  }, [id, registerValidationMessage, removeValidationMessage]);

  const Component = as || 'span';

  const componentProps = {
    ...props,
    id: props.id ?? id,
  } as ComponentPropsWithRef<E>;

  return <Component ref={ref} {...componentProps} />;
}) as <E extends ElementType = 'span'>(
  props: ValidationMessageProps<E>,
) => JSX.Element;
