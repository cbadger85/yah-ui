import { FieldContext } from '../Field';
import { useGenerateUniqueIdOrDefault } from '../../hooks';
import {
  ComponentPropsWithRef,
  forwardRef,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
} from 'react';

export interface ToggleProps extends ComponentPropsWithRef<'button'> {
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
  invalid?: boolean;
}

function useGetTogglePropsFromFieldContext(id: string) {
  const [_, actions] = useContext(FieldContext);

  useEffect(() => {
    actions.registerComponent('field', { id });

    return () => actions.removeComponent('field');
  }, [id, actions]);

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
    [id],
  );
}

export const Toggle = forwardRef(function Toggle(
  { checked, onToggle, invalid, ...props }: ToggleProps,
  ref: ComponentPropsWithRef<'button'>['ref'],
) {
  const id = useGenerateUniqueIdOrDefault(props.id, {
    generatedIdPrefix: 'toggle',
  });
  const getTogglePropsFromFieldContext = useGetTogglePropsFromFieldContext(id);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    props.onClick?.(e);
    onToggle?.(!checked);
  }

  return (
    <button
      ref={ref}
      {...getTogglePropsFromFieldContext({
        ...props,
        role: props.role ?? 'switch',
        ['aria-checked']: props['aria-checked'] ?? checked,
        ['aria-invalid']: props['aria-invalid'] ?? invalid,
        onClick: handleClick,
      })}
    />
  );
});
