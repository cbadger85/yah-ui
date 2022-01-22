import { useFieldState, FieldActions, FieldState } from './state';
import { createContext, ReactNode } from 'react';
import { noop } from '../../utils';

export const FieldContext = createContext<[FieldState, FieldActions]>([
  { validationMessages: [] },
  {
    registerComponent: noop,
    removeComponent: noop,
    registerValidationMessage: noop,
    removeValidationMessage: noop,
  },
]);

export interface FieldProps {
  children?: ReactNode;
  initialState?: Partial<FieldState>;
}

export function Field({ children, initialState }: FieldProps) {
  const context = useFieldState(initialState);

  return (
    <FieldContext.Provider value={context}>{children}</FieldContext.Provider>
  );
}
