import { useCallback, useMemo, useReducer } from 'react';

export interface ValidationMessageData {
  id: string;
}

export interface FieldState {
  validationMessages: ValidationMessageData[];
}

export type FieldComponent = 'field' | 'label';

export interface FieldActions {
  registerValidationMessage: (props: ValidationMessageData) => void;
  removeValidationMessage: (id: string) => void;
}

export interface RegisterValidationMessageAction {
  type: 'registerValidationMessage';
  payload: ValidationMessageData;
}

export interface RemoveValidationMessageAction {
  type: 'removeValidationMessage';
  payload: ValidationMessageData;
}

export type FieldStateAction =
  | RegisterValidationMessageAction
  | RemoveValidationMessageAction;

export function fieldStateReducer(
  state: FieldState,
  action: FieldStateAction,
): FieldState {
  switch (action.type) {
    case 'registerValidationMessage':
      return {
        ...state,
        validationMessages: [...state.validationMessages, action.payload],
      };

    case 'removeValidationMessage':
      return {
        ...state,
        validationMessages: state.validationMessages.filter(
          (message) => message.id !== action.payload.id,
        ),
      };

    default:
      return state;
  }
}

export function useFieldState(
  initialState?: Partial<FieldState>,
): [FieldState, FieldActions] {
  const [state, dispatch] = useReducer(fieldStateReducer, {
    validationMessages: [],
    ...initialState,
  });

  const registerValidationMessage = useCallback(
    (props: ValidationMessageData) =>
      dispatch({
        type: 'registerValidationMessage',
        payload: props,
      } as RegisterValidationMessageAction),
    [],
  );

  const removeValidationMessage = useCallback(
    (id: string) =>
      dispatch({ type: 'removeValidationMessage', payload: { id } }),
    [],
  );

  const actions = useMemo(
    () => ({
      registerValidationMessage,
      removeValidationMessage,
    }),
    [registerValidationMessage, removeValidationMessage],
  );

  return [state, actions];
}
