import { Datalist } from './Datalist';
import { render } from '@testing-library/react';

describe('<Datalist />', () => {
  it('should generate a unique ID', async () => {
    render(<Datalist />);

    expect(document.querySelector('datalist')?.id).toEqual(expect.any(String));
  });

  it('should use the id passed in as a prop if provided', async () => {
    const id = 'datalist-id';
    render(<Datalist id={id} />);

    expect(document.querySelector('datalist')?.id).toEqual(expect.any(String));
  });
});
