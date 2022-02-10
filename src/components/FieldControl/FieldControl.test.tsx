import { render } from '@testing-library/react';
import React from 'react';
import { FieldButton, Input, Select } from '../FieldControl';
import { fieldControlFactory } from './FieldControl';

describe.each([
  ['<Input />', Input, 'input'],
  ['<FieldButton />', FieldButton, 'button'],
  ['<Select />', Select, 'select'],
])('[%#] %s', (_, Component, element) => {
  it('should use the id passed in as a prop if provided', () => {
    const id = `${element}-id`;
    render(<Component id={id} />);

    expect(document.querySelector(element)?.id).toBe(id);
  });

  it.each([
    ['invalid', true],
    ['invalid', false],
    ['aria-invalid', true],
    ['aria-invalid', false],
  ])(
    '[%#] --> should set the aria-invalid attribute to the same value as the %s prop [%s]',
    (propName, invalid) => {
      const componentProps = { [propName]: invalid };

      render(<Component {...componentProps} />);

      expect(document.querySelector(element)).toHaveAttribute(
        'aria-invalid',
        String(invalid),
      );
    },
  );

  it('should not have the aria-invalid attribute if invalid is undefined', () => {
    render(<Component invalid={undefined} />);

    expect(document.querySelector(element)).not.toHaveAttribute(
      'aria-invalid',
      expect.any(String),
    );
  });

  it('should use the invalid prop value if both invalid and aria-invalid are present', () => {
    render(<Component invalid={false} aria-invalid />);

    expect(document.querySelector(element)).toHaveAttribute(
      'aria-invalid',
      String(false),
    );
  });

  it.each(['describedBy', 'aria-describedby'])(
    '[%#] --> should set the aria-describedby attribute to the same value as the %s prop',
    (propName) => {
      const descriptionId = 'description-id';

      const props = { [propName]: descriptionId };

      render(<Component {...props} />);

      expect(document.querySelector(element)).toHaveAttribute(
        'aria-describedby',
        descriptionId,
      );
    },
  );

  it('should combine the aria-describedby and describedBy attribute if both are present', () => {
    const descriptionId1 = 'description-id-1';
    const descriptionId2 = 'description-id-2';

    render(
      <Component
        describedBy={descriptionId1}
        aria-describedby={descriptionId2}
      />,
    );

    expect(document.querySelector(element)).toHaveAttribute(
      'aria-describedby',
      `${descriptionId1} ${descriptionId2}`,
    );
  });
});

describe('fieldControlFactory', () => {
  it('should be produce an input if no parameters are passed into the factory', () => {
    const Component = fieldControlFactory();

    const testid = 'testid';

    render(<Component data-testid={testid} />);

    expect(document.querySelector('input')).toHaveAttribute(
      'data-testid',
      testid,
    );
  });
});
