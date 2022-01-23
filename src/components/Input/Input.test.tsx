import { render } from '@testing-library/react';
import { Input } from './Input';

describe('<Input />', () => {
  it('should generate a unique ID', async () => {
    render(<Input />);

    expect(document.querySelector('input')?.id).toEqual(expect.any(String));
  });

  it('should use the id passed in as a prop if provided', async () => {
    const id = 'input-id';
    render(<Input id={id} />);

    expect(document.querySelector('input')?.id).toBe('input-id');
  });

  it.each([true, false])(
    '[%#] --> should set the aria-invalid attribute to the same value as the invalid prop [%s]',
    (invalid) => {
      render(<Input invalid={invalid} />);

      expect(document.querySelector('input')).toHaveAttribute(
        'aria-invalid',
        String(invalid),
      );
    },
  );

  it('should not have the aria-invalid attribute if invalid is undefined', () => {
    render(<Input invalid={undefined} />);

    expect(document.querySelector('input')).not.toHaveAttribute(
      'aria-invalid',
      expect.any(String),
    );
  });

  it('should set the aria-describedby attribute to the same value as the describedBy prop', () => {
    const descriptionId = 'description-id';

    render(<Input describedBy={descriptionId} />);

    expect(document.querySelector('input')).toHaveAttribute(
      'aria-describedby',
      descriptionId,
    );
  });

  it('should set the aria-describedby attribute to the same value as the aria-describedby prop', () => {
    const descriptionId = 'description-id';

    render(<Input aria-describedby={descriptionId} />);

    expect(document.querySelector('input')).toHaveAttribute(
      'aria-describedby',
      descriptionId,
    );
  });

  it('should combine the aria-describedby and describedBy attribute if both are present', () => {
    const descriptionId1 = 'description-id-1';
    const descriptionId2 = 'description-id-2';

    render(
      <Input describedBy={descriptionId1} aria-describedby={descriptionId2} />,
    );

    expect(document.querySelector('input')).toHaveAttribute(
      'aria-describedby',
      `${descriptionId1} ${descriptionId2}`,
    );
  });
});
