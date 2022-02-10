import { StrictMode, useState } from 'react';
import { render } from 'react-dom';
import { Field, Input, Label } from 'yah-ui';
import { Toasts } from './components/Toasts/Toasts';

function App() {
  const [input, setInput] = useState('');
  return (
    <Field>
      <Label>Test label</Label>
      <Input onChange={(e) => setInput(e.target.value)} value={input} />
    </Field>
  );
}

render(
  <StrictMode>
    <Toasts />
  </StrictMode>,
  document.getElementById('root'),
);
