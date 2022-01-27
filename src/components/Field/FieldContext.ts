import { createContext } from 'react';
import { FieldState, FieldActions } from './useFieldState';
import { noop } from '../../utils';

interface FieldData extends FieldState {
  fieldControl: { id?: string };
  label: { id?: string };
}

export const FieldContext = createContext<[FieldData, FieldActions]>([
  { validationMessages: [], fieldControl: {}, label: {} },
  {
    registerValidationMessage: noop,
    removeValidationMessage: noop,
  },
]);
