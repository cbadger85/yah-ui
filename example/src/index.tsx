import { StrictMode, useState } from 'react';
import { render } from 'react-dom';
import { Field, Input, Label } from 'yah-ui';

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
    <App />
  </StrictMode>,
  document.getElementById('root'),
);
