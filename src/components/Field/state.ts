import { useCallback, useReducer } from 'react';

export interface FieldData {
  id: string;
}

export interface LabelData {
  id: string;
}

export interface DatalistData {
  id: string;
}

export interface ValidationMessageData {
  id: string;
}

export interface FieldState {
  field?: FieldData;
  label?: LabelData;
  datalist?: DatalistData;
  validationMessages: ValidationMessageData[];
}

export interface FieldActions {
  registerComponent: <T extends 'field' | 'label' | 'datalist'>(
    componentType: T,
    props: FieldState[T],
  ) => void;
  removeComponent: (componentType: 'field' | 'label' | 'datalist') => void;
  registerValidationMessage: (props: ValidationMessageData) => void;
  removeValidationMessage: (id: string) => void;
}

export interface RegisterComponentAction {
  type: 'registerComponent';
  payload:
    | ({ componentType: 'field' } & FieldData)
    | ({ componentType: 'label' } & LabelData)
    | ({ componentType: 'datalist' } & DatalistData);
}

export interface RemoveComponentAction {
  type: 'removeComponent';
  payload: {
    componentType: 'field' | 'label' | 'datalist';
  };
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
  | RegisterComponentAction
  | RemoveComponentAction
  | RegisterValidationMessageAction
  | RemoveValidationMessageAction;

function fieldStateReducer(
  state: FieldState,
  action: FieldStateAction,
): FieldState {
  switch (action.type) {
    case 'registerComponent':
      return {
        ...state,
        [action.payload.componentType]: action.payload,
      };

    case 'removeComponent':
      return { ...state, [action.payload.componentType]: undefined };

    case 'registerValidationMessage':
      return action.payload.id
        ? {
            ...state,
            validationMessages: [...state.validationMessages, action.payload],
          }
        : state;

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

  const registerComponent = useCallback(
    <T extends 'field' | 'label' | 'datalist'>(
      componentType: T,
      props: FieldState[T],
    ) =>
      dispatch({
        type: 'registerComponent',
        payload: { componentType, ...props },
      } as RegisterComponentAction),
    [],
  );

  const removeComponent = useCallback(
    (componentType: 'field' | 'label' | 'datalist') =>
      dispatch({ type: 'removeComponent', payload: { componentType } }),
    [],
  );

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

  return [
    state,
    {
      registerComponent,
      removeComponent,
      registerValidationMessage,
      removeValidationMessage,
    },
  ];
}
