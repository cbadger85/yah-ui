import { ReactNode } from 'react';
import { useGenerateUniqueId } from '../../hooks';
import { FieldContext } from './FieldContext';
import { useFieldState } from './useFieldState';

export interface FieldProps {
  children?: ReactNode;
}

export function Field({ children }: FieldProps) {
  const [state, actions] = useFieldState();
  const id = useGenerateUniqueId();
  const fieldId = 'field-'.concat(id);
  const labelId = 'label-'.concat(id);

  return (
    <FieldContext.Provider
      value={[
        {
          ...state,
          field: { id: fieldId },
          label: { id: labelId },
          baseId: id,
        },
        actions,
      ]}
    >
      {children}
    </FieldContext.Provider>
  );
}
