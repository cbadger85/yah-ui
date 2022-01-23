import { ComponentPropsWithRef, ElementType } from 'react';

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

export type PolymorphicProps<E extends ElementType, P> = P &
  Omit<ComponentPropsWithRef<E>, keyof P>;

export interface BaseFieldComponentProps {
  invalid?: boolean;
  describedBy?: string;
}
