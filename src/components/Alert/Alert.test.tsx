import { render } from '@testing-library/react';
import React from 'react';
import { Alert } from './Alert';

describe('<Alert />', () => {
  it('should set the role to `alert` by default', () => {
    const { getByTestId } = render(<Alert data-testid="alert" />);

    expect(getByTestId('alert')).toHaveAttribute('role', 'alert');
  });

  it('should overwrite the default role if a role is provided', () => {
    const { getByTestId } = render(
      <Alert data-testid="alert" role="alertdialog" />,
    );

    expect(getByTestId('alert')).toHaveAttribute('role', 'alertdialog');
  });

  it('should set the aria-live to `polite` by default', () => {
    const { getByTestId } = render(<Alert data-testid="alert" />);

    expect(getByTestId('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('should overwrite the default aria-live if an aria-live is provided', () => {
    const { getByTestId } = render(
      <Alert data-testid="alert" aria-live="assertive" />,
    );

    expect(getByTestId('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('should be a div by default', () => {
    const { getByTestId } = render(<Alert data-testid="alert" />);

    expect(getByTestId('alert')).toBeInstanceOf(HTMLDivElement);
  });

  it('should overwrite the component if an `as` prop is provided', () => {
    const { getByTestId } = render(<Alert data-testid="alert" as="span" />);

    expect(getByTestId('alert')).toBeInstanceOf(HTMLSpanElement);
  });
});
