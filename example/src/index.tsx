import { StrictMode } from 'react';
import { render } from 'react-dom';
import { Field, Input, Label } from 'yah-ui';

render(
  <StrictMode>
    <Field>
      <Label>Test label</Label>
      <Input />
    </Field>
  </StrictMode>,
  document.getElementById('root'),
);
