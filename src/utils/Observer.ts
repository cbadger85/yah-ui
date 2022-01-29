type Listener<T> = (val: T) => void;
type Unsubscriber = () => void;

export interface Observable<T> {
  readonly value: T;
  setValue: (value: T) => void;
  subscribe: (listener: Listener<T>) => Unsubscriber;
}

export class ObservableState<T> implements Observable<T> {
  #listeners: Listener<T>[] = [];
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  get value(): T {
    return this.#value;
  }

  setValue(value: T) {
    if (this.#value !== value) {
      this.#value = value;
      this.#listeners.forEach((l) => l(value));
    }
  }

  subscribe(listener: Listener<T>): Unsubscriber {
    this.#listeners.push(listener);
    return () => {
      this.#listeners = this.#listeners.filter((l) => l !== listener);
    };
  }
}
