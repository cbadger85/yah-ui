import { FieldContext } from '../Field';
import { useGenerateUniqueIdOrDefault } from '../../hooks';
import {
  ComponentPropsWithRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
} from 'react';

export interface DatalistProps extends ComponentPropsWithRef<'datalist'> {}

function useGetDatalistPropsFromFieldContext(id: string) {
  const [_, actions] = useContext(FieldContext);

  useEffect(() => {
    actions.registerComponent('datalist', { id });

    return () => actions.removeComponent('datalist');
  }, [id, actions.registerComponent, actions.removeComponent]);

  return useCallback(
    (
      props: ComponentPropsWithRef<'datalist'> = {},
    ): ComponentPropsWithRef<'datalist'> => {
      return {
        ...props,
        id,
      };
    },
    [id],
  );
}

export const Datalist = forwardRef(function Datalist(
  props: DatalistProps,
  ref: ComponentPropsWithRef<'datalist'>['ref'],
) {
  const id = useGenerateUniqueIdOrDefault(props.id, {
    generatedIdPrefix: 'datalist',
  });
  const getDatalistPropsFromFieldContext =
    useGetDatalistPropsFromFieldContext(id);

  return <datalist ref={ref} {...getDatalistPropsFromFieldContext(props)} />;
});
