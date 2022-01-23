import { createContext } from 'react';
import { FieldState, FieldActions } from './useFieldState';
import { noop } from '../../utils';

interface FieldData extends FieldState {
  baseId?: string;
  field: { id?: string };
  label: { id?: string };
}

export const FieldContext = createContext<[FieldData, FieldActions]>([
  { validationMessages: [], field: {}, label: {} },
  {
    registerValidationMessage: noop,
    removeValidationMessage: noop,
  },
]);
