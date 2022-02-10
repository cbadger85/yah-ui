import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Toggle } from './Toggle';

describe('<Toggle />', () => {
  it.each([
    ['checked', true],
    ['checked', false],
    ['aria-checked', true],
    ['aria-checked', false],
  ])(
    '[%#] --> should set the aria-checked attribute to the same value as the %s prop [%s]',
    (propName, checked) => {
      const toggleProps = { [propName]: checked };

      render(<Toggle {...toggleProps} />);

      expect(document.querySelector('button')).toHaveAttribute(
        'aria-checked',
        String(checked),
      );
    },
  );

  it('should have a value of false if neither checked nor aria-checked is defined', () => {
    render(<Toggle invalid={undefined} />);

    expect(document.querySelector('button')).not.toHaveAttribute(
      'aria-invalid',
      String(false),
    );
  });

  it('should use the checked prop value if both checked and aria-checked are present', () => {
    render(<Toggle checked={false} aria-checked />);

    expect(document.querySelector('button')).toHaveAttribute(
      'aria-checked',
      String(false),
    );
  });

  it('should call onClick when the button is clicked', () => {
    const testid = 'testid';
    const onClick = jest.fn();

    const { getByTestId } = render(
      <Toggle data-testid={testid} onClick={onClick} />,
    );

    fireEvent.click(getByTestId(testid));

    expect(onClick).toBeCalled();
  });

  it.each([
    [false, true],
    [false, true],
  ])(
    'should call onToggle with %s if checked is %s',
    (expectedValue, curentValue) => {
      const testid = 'testid';
      const onToggle = jest.fn();

      const { getByTestId } = render(
        <Toggle
          data-testid={testid}
          onToggle={onToggle}
          checked={curentValue}
        />,
      );

      fireEvent.click(getByTestId(testid));

      expect(onToggle).toBeCalledWith(expectedValue);
    },
  );
});
