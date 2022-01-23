import { render } from '@testing-library/react';
import { Input, FieldButton, Select } from '../FieldControl';
import React from 'react';

describe.each([
  ['<Input />', Input, 'input'],
  ['<FieldButton />', FieldButton, 'button'],
  ['<Select />', Select, 'select'],
])('[%#] %s', (_, Component, element) => {
  it('should generate a unique ID', () => {
    render(<Component />);

    expect(document.querySelector(element)?.id).toEqual(expect.any(String));
  });

  it('should use the id passed in as a prop if provided', () => {
    const id = `${element}-id`;
    render(<Component id={id} />);

    expect(document.querySelector(element)?.id).toBe(id);
  });

  it.each([true, false])(
    '[%#] --> should set the aria-invalid attribute to the same value as the invalid prop [%s]',
    (invalid) => {
      render(<Component invalid={invalid} />);

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

  it('should set the aria-describedby attribute to the same value as the describedBy prop', () => {
    const descriptionId = 'description-id';

    render(<Component describedBy={descriptionId} />);

    expect(document.querySelector(element)).toHaveAttribute(
      'aria-describedby',
      descriptionId,
    );
  });

  it('should set the aria-describedby attribute to the same value as the aria-describedby prop', () => {
    const descriptionId = 'description-id';

    render(<Component aria-describedby={descriptionId} />);

    expect(document.querySelector(element)).toHaveAttribute(
      'aria-describedby',
      descriptionId,
    );
  });

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
