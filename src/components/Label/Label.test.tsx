import { render } from '@testing-library/react';
import React from 'react';
import { Label } from './Label';

describe('<Label />', () => {
  it('should use the id passed in as a prop if provided', () => {
    const id = 'label-id';
    render(<Label id={id} />);

    expect(document.querySelector('label')).toHaveAttribute('id', id);
  });

  it('should use the htmlFor passed in as a prop if provided', () => {
    const id = 'control-id';
    render(<Label htmlFor={id} />);

    expect(document.querySelector('label')).toHaveAttribute('for', id);
  });
});
