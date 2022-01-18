import { FieldContext } from 'components/Field';
import { useGenerateUniqueIdOrDefault } from 'hooks';
import {
  ComponentPropsWithRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
} from 'react';

export interface ToggleProps extends ComponentPropsWithRef<'button'> {
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
}

function useGetTogglePropsFromFieldContext(id: string) {
  const [state, actions] = useContext(FieldContext);

  useEffect(() => {
    actions.registerComponent('field', { id });

    return () => actions.removeComponent('field');
  }, [id, actions.registerComponent, actions.removeComponent]);

  return useCallback(
    (
      props: ComponentPropsWithRef<'button'> = {},
    ): ComponentPropsWithRef<'button'> => {
      return {
        ...props,
        id,
        type: props.type ?? 'button',
      };
    },
    [id, state.datalist?.id, state.validationMessages],
  );
}

export const Toggle = forwardRef(function Toggle(
  { checked, onToggle, ...props }: ToggleProps,
  ref: ComponentPropsWithRef<'button'>['ref'],
) {
  const id = useGenerateUniqueIdOrDefault(props.id, {
    generatedIdPrefix: 'toggle',
  });
  const getTogglePropsFromFieldContext = useGetTogglePropsFromFieldContext(id);

  return (
    <button
      ref={ref}
      {...getTogglePropsFromFieldContext({
        ...props,
        role: props.role ?? 'switch',
        ['aria-checked']: props['aria-checked'] ?? checked,
        onClick: (e) => {
          props.onClick?.(e);
          onToggle?.(!checked);
        },
      })}
    />
  );
});
