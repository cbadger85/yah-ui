import { render } from '@testing-library/react';
import React from 'react';
import { resetIds } from '../../hooks';
import { FieldButton, Input, Select } from '../FieldControl';
import { Label } from '../Label';
import { ValidationMessage } from '../ValidationMessage';
import { Field } from './Field';

beforeEach(() => {
  resetIds();
});

describe('<Field />', () => {
  describe.each([
    ['<Input />', 'input', Input],
    ['<Button />', 'button', FieldButton],
    ['<Select />', 'select', Select],
  ])('[%#] [%s]', (_, controlElement, Control) => {
    it('should auto generate the label and control Ids, and link the two together', () => {
      const { getByLabelText, getByText } = render(
        <Field>
          <Label>Control Label</Label>
          <Control />
        </Field>,
      );

      expect(getByText('Control Label').id).toBe('label-1');
      expect(getByLabelText('Control Label').id).toBe('field-control-1');
    });

    it('should not use the auto generated Ids if the id attributes are provided', () => {
      const labelId = 'labelId';
      const controlId = 'controlId';

      const { queryByLabelText, getByText } = render(
        <Field>
          <Label id={labelId}>Control Label</Label>
          <Control id={controlId} />
        </Field>,
      );

      expect(getByText('Control Label').id).toBe(labelId);
      expect(queryByLabelText('Control Label')).toBeNull();
      expect(document.querySelector(controlElement)?.id).toBe(controlId);
    });

    it('should describe the control with the validation messages', () => {
      const testid = 'message';

      const { getByLabelText } = render(
        <Field>
          <Label>Control Label</Label>
          <Control />
          <ValidationMessage data-testid={testid}>Error 1</ValidationMessage>
          <ValidationMessage data-testid={testid}>Error 2</ValidationMessage>
          <ValidationMessage data-testid={testid}>Error 3</ValidationMessage>
          <ValidationMessage data-testid={testid}>Error 4</ValidationMessage>
        </Field>,
      );

      expect(getByLabelText('Control Label')).toHaveAccessibleDescription(
        'Error 1 Error 2 Error 3 Error 4',
      );
    });

    it('should not add the message to the control description if an id is provided', () => {
      const id = 'messageid';

      const { getByLabelText } = render(
        <Field>
          <Label>Control Label</Label>
          <Control />
          <ValidationMessage id={id}>Error 1</ValidationMessage>
        </Field>,
      );

      expect(getByLabelText('Control Label')).toHaveAccessibleDescription('');
    });
  });
});
