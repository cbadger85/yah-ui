import { useFieldState, FieldActions, FieldState } from './state';
import { createContext, ReactNode } from 'react';

export const FieldContext = createContext<[FieldState, FieldActions]>([
  { validationMessages: [] },
  {
    registerComponent() {},
    removeComponent() {},
    registerValidationMessage() {},
    removeValidationMessage() {},
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
