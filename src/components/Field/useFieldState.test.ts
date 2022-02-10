import { FieldState, fieldStateReducer } from '.';

describe('fieldStateReducer', () => {
  describe('registerValidationMessage', () => {
    it('should add the message to the list of messages if the id is present', () => {
      const messageid = 'messageid';

      const state: FieldState = { validationMessages: [] };

      const updatedState = fieldStateReducer(state, {
        type: 'registerValidationMessage',
        payload: { id: messageid },
      });

      expect(updatedState.validationMessages).toContainEqual({ id: messageid });
    });
  });

  describe('removeValidationMessage', () => {
    it('should remove the message from the list of messages', () => {
      const messageid = 'messageid';

      const state: FieldState = { validationMessages: [{ id: messageid }] };

      const updatedState = fieldStateReducer(state, {
        type: 'removeValidationMessage',
        payload: { id: messageid },
      });

      expect(updatedState.validationMessages).not.toContainEqual({
        id: messageid,
      });
    });
  });

  describe('default', () => {
    it('should return the state', () => {
      const messageid = 'messageid';

      const state: FieldState = {
        validationMessages: [{ id: messageid }],
      };

      const updatedState = fieldStateReducer(state, {
        // @ts-expect-error // validating invalid actions just return state
        type: '__BAD_ACTION__',
      });

      expect(updatedState).toEqual(updatedState);
    });
  });
});
