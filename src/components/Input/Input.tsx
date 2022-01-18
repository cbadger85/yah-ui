import { FieldContext } from 'components/Field';
import { useGenerateUniqueIdOrDefault } from 'hooks';
import {
  ComponentPropsWithRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { mergeIds } from 'utils';

export interface InputProps extends ComponentPropsWithRef<'input'> {
  invalid?: boolean;
}

function useGetInputPropsFromFieldContext(id: string) {
  const [state, actions] = useContext(FieldContext);

  useEffect(() => {
    actions.registerComponent('field', { id });

    return () => actions.removeComponent('field');
  }, [id, actions.registerComponent, actions.removeComponent]);

  return useCallback(
    (
      props: ComponentPropsWithRef<'input'> = {},
    ): ComponentPropsWithRef<'input'> => {
      return {
        ...props,
        id,
        list: props.list ?? state.datalist?.id,
        ['aria-describedby']: mergeIds(
          props['aria-describedby'],
          ...state.validationMessages.map(({ id }) => id),
        ),
      };
    },
    [id, state.datalist?.id, state.validationMessages],
  );
}

export const Input = forwardRef(function Input(
  { invalid, ...props }: InputProps,
  ref: ComponentPropsWithRef<'input'>['ref'],
) {
  const id = useGenerateUniqueIdOrDefault(props.id, {
    generatedIdPrefix: 'input',
  });
  const getInputPropsFromFieldContext = useGetInputPropsFromFieldContext(id);

  return (
    <input
      ref={ref}
      {...getInputPropsFromFieldContext({
        ...props,
        ['aria-invalid']: props['aria-invalid'] ?? invalid,
      })}
    />
  );
});
