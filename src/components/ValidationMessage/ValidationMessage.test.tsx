import { render } from '@testing-library/react';
import React from 'react';
import { ValidationMessage } from '.';

describe('<Validation Message />', () => {
  it('should set the id to a generated value if no id is provided', () => {
    render(<ValidationMessage />);

    const messageId = document.querySelector('span')?.id
    
    expect(messageId).toEqual(expect.any(String));
    expect(messageId).not.toHaveLength(0);
  });

  it('should use the id attribute to the provided id', () => {
    const id = "message";

    render(<ValidationMessage id={id} />);

    const messageId = document.querySelector('span')?.id
    
    expect(messageId).toBe(id);
  });

    it('should set the aria-live to `polite` by default', () => {
      render(<ValidationMessage />);

      const messageId = document.querySelector('span')?.id;

      expect(document.querySelector('span')).toHaveAttribute('aria-live', 'polite')
      expect(messageId).not.toHaveLength(0);
    });
  
});


