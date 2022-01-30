import React, { ReactElement, ReactNode } from 'react';
import { useGenerateUniqueId } from '../../hooks';
import { FieldContext } from './FieldContext';
import { useFieldState } from './useFieldState';

export interface FieldProps {
  children?: ReactNode;
}

export function Field({ children }: FieldProps): ReactElement {
  const [state, actions] = useFieldState();
  const fieldControlId = useGenerateUniqueId('field-control');
  const labelId = useGenerateUniqueId('label');

  return (
    <FieldContext.Provider
      value={[
        {
          ...state,
          fieldControl: { id: fieldControlId },
          label: { id: labelId },
        },
        actions,
      ]}
    >
      {children}
    </FieldContext.Provider>
  );
}
