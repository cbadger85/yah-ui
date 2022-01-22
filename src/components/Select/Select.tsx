import { FieldContext } from '../Field';
import { useGenerateUniqueIdOrDefault } from '../../hooks';
import {
  ComponentPropsWithRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { mergeIds } from '../../utils';

export interface SelectProps extends ComponentPropsWithRef<'select'> {
  invalid?: boolean;
}

function useGetSelectPropsFromFieldContext(id: string) {
  const [state, actions] = useContext(FieldContext);

  useEffect(() => {
    actions.registerComponent('field', { id });

    return () => actions.removeComponent('field');
  }, [id, actions]);

  return useCallback(
    (
      props: ComponentPropsWithRef<'select'> = {},
    ): ComponentPropsWithRef<'select'> => {
      return {
        ...props,
        id,
        ['aria-describedby']: mergeIds(
          props['aria-describedby'],
          ...state.validationMessages.map(({ id }) => id),
        ),
      };
    },
    [id, state.validationMessages],
  );
}

export const Select = forwardRef(function Select(
  { invalid, ...props }: SelectProps,
  ref: ComponentPropsWithRef<'select'>['ref'],
) {
  const id = useGenerateUniqueIdOrDefault(props.id, {
    generatedIdPrefix: 'select',
  });
  const getSelectPropsFromFieldContext = useGetSelectPropsFromFieldContext(id);

  return (
    <select
      ref={ref}
      {...getSelectPropsFromFieldContext({
        ...props,
        ['aria-invalid']: props['aria-invalid'] ?? invalid,
      })}
    />
  );
});
