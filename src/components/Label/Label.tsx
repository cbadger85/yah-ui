import { FieldContext } from '../Field';
import { useGenerateUniqueId } from '../../hooks';
import {
  ComponentPropsWithRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
} from 'react';

export type LabelProps = ComponentPropsWithRef<'label'>;

export function useGetLabelPropsFromFieldContext(id: string | undefined) {
  const [state, actions] = useContext(FieldContext);
  const generatedId = useGenerateUniqueId('label');
  const labelId = id ?? generatedId;

  useEffect(() => {
    actions.registerComponent('label', { id: labelId });

    return () => actions.removeComponent('label');
  }, [labelId, actions]);

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

  /**
   *  The control will be a sibling/child of the label, with accessible
   *  identifiers passed through context.
   */
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  return <label ref={ref} {...getLabelPropsFromFieldContext(props)} />;
});
