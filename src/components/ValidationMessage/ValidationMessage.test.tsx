import { render } from '@testing-library/react';
import React from 'react';
import { ValidationMessage } from '.';

describe('<Validation Message />', () => {
  it('should set the id to a generated value if no id is provided', () => {
    const testId = "testid";
    const {getByTestId} = render(<ValidationMessage data-testid={testId} />);

    const messageId = getByTestId(testId).id;

    expect(messageId).toEqual(expect.any(String));
    expect(messageId).not.toHaveLength(0);
  });

  it('should use the id attribute to the provided id', () => {
    const testId = 'testid';
    const id = 'message';

    const { getByTestId } = render(
      <ValidationMessage id={id} data-testid={testId} />,
    );

    const messageId = getByTestId(testId).id;

    expect(messageId).toBe(id);
  });

  it('should set the aria-live to `polite` by default', () => {
    const testId = 'testid';
    const { getByTestId } = render(<ValidationMessage data-testid={testId} />);


    expect(getByTestId(testId)).toHaveAttribute('aria-live', 'polite');
  });

    it('should be a span element by default', () => {
      const testId = 'testid';
      const { getByTestId } = render(
        <ValidationMessage data-testid={testId} />,
      );

      expect(getByTestId(testId)).toBeInstanceOf(HTMLSpanElement);
    });

        it('should become the provided element type', () => {
          const testId = 'testid';
          const { getByTestId } = render(
            <ValidationMessage data-testid={testId} as="div" />,
          );

          expect(getByTestId(testId)).toBeInstanceOf(HTMLDivElement);
        });
});
