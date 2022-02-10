export type Listener<T> = (val: T) => void;
export type Unsubscriber = () => void;

export interface ReactiveStore<T> {
  getValue: () => T;
  setValue: (value: T) => void;
  subscribe: (listener: Listener<T>) => Unsubscriber;
}

export class Store<T> implements ReactiveStore<T> {
  #listeners: Listener<T>[] = [];
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  getValue(): T {
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
      this.#listeners = this.#listeners.filter(
        (activeListener) => activeListener !== listener,
      );
    };
  }
}
