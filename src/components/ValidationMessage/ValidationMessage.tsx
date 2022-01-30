import React, {
  ElementType,
  forwardRef,
  ReactElement,
  useContext,
  useEffect,
} from 'react';
import { useGenerateUniqueId } from '../../hooks';
import { PolymorphicComponentPropsWithRef, PolymorphicRef } from '../../types';
import { noop } from '../../utils';
import { FieldContext } from '../Field';

// can be replaced with a real type when ValidationMessage needs its own props.
export type ValidationMessageOwnProps = Record<never, never>;

export type ValidationMessageProps<C extends ElementType = 'span'> =
  PolymorphicComponentPropsWithRef<C, ValidationMessageOwnProps>;

export type ValidationMessageComponent = <C extends ElementType = 'span'>(
  props: ValidationMessageProps<C>,
) => ReactElement | null;

export const ValidationMessage: ValidationMessageComponent = forwardRef(
  function ValidationMessage<C extends ElementType = 'span'>(
    { as, ...props }: ValidationMessageProps<C>,
    ref: PolymorphicRef<C>,
  ) {
    const [_, { registerValidationMessage, removeValidationMessage }] =
      useContext(FieldContext);

    const generatedId = useGenerateUniqueId('validation-message');
    const id = props?.id || generatedId;

    useEffect(
      function register() {
        if (id === generatedId) {
          registerValidationMessage({ id });

          return function cleanup() {
            return removeValidationMessage(id);
          };
        } else {
          return noop;
        }
      },
      [generatedId, id, registerValidationMessage, removeValidationMessage],
    );

    const Component = as || 'span';

    return (
      <Component
        ref={ref}
        {...props}
        id={id}
        aria-live={props['aria-live'] ?? 'polite'}
      />
    );
  },
);
