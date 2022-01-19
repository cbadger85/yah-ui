import { FieldContext } from '../Field';
import { useGenerateUniqueId } from '../../hooks';
import {
  ComponentPropsWithRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
} from 'react';

export interface LabelProps extends ComponentPropsWithRef<'label'> {}

export function useGetLabelPropsFromFieldContext(id: string | undefined) {
  const [state, actions] = useContext(FieldContext);
  const generatedId = useGenerateUniqueId('label');
  const labelId = id ?? generatedId;

  useEffect(() => {
    actions.registerComponent('label', { id: labelId });

    return () => actions.removeComponent('label');
  }, [labelId, actions.registerComponent, actions.removeComponent]);

  return useCallback(
    (
      props: ComponentPropsWithRef<'label'> = {},
    ): ComponentPropsWithRef<'label'> => {
      return {
        ...props,
        id: labelId,
        htmlFor: props.htmlFor ?? state.field?.id,
      };
    },
    [labelId, state],
  );
}

export const Label = forwardRef(function Label(
  props: LabelProps,
  ref: ComponentPropsWithRef<'label'>['ref'],
) {
  const getLabelPropsFromFieldContext = useGetLabelPropsFromFieldContext(
    props.id,
  );

  return <label ref={ref} {...getLabelPropsFromFieldContext()} />;
});
