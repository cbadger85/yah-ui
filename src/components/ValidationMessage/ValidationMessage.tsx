import { FieldContext } from '../Field';
import { useGenerateUniqueIdOrDefault } from '../../hooks';
import {
  ComponentPropsWithRef,
  ElementType,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { PolymorphicProps } from '../../types';

export interface ValidationMessageOwnProps<E extends ElementType = 'span'> {
  as?: E;
}

export type ValidationMessageProps<E extends ElementType = 'span'> =
  PolymorphicProps<E, ValidationMessageOwnProps<E>>;

function useGetValidationMessagePropsFromFieldContext<
  E extends ElementType = 'span',
>(id: string) {
  const [_, actions] = useContext(FieldContext);

  useEffect(() => {
    actions.registerValidationMessage({ id });

    return () => actions.removeValidationMessage(id);
  }, [id, actions.registerValidationMessage, actions.removeValidationMessage]);

  return useCallback(
    (props?: ComponentPropsWithRef<E>): ComponentPropsWithRef<E> => {
      return {
        ...(props || {}),
        id,
      } as ComponentPropsWithRef<E>;
    },
    [id],
  );
}

export const ValidationMessage = forwardRef(function ValidationMessage<
  E extends ElementType = 'span',
>(
  { as, ...props }: ValidationMessageProps<E>,
  ref: ComponentPropsWithRef<E>['ref'],
) {
  const id = useGenerateUniqueIdOrDefault(props.id, {
    generatedIdPrefix: 'input',
  });

  const getValidationMessagePropsFromFieldContext =
    useGetValidationMessagePropsFromFieldContext<E>(id);

  const Component = as || 'span';

  return (
    <Component
      ref={ref}
      {...getValidationMessagePropsFromFieldContext(
        props as ComponentPropsWithRef<E>,
      )}
    />
  );
}) as <E extends ElementType = 'span'>(
  props: ValidationMessageProps<E>,
) => JSX.Element;
