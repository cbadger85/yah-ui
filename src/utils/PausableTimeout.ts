export interface PausableTimeout {
  /**
   * @returns the timeoutId of the current timeout.
   */
  getTimeoutId: () => number;
  /**
   * @returns the time remaining for the timeout.
   */
  pause: () => number;
  resume: () => void;
}

class Timeout implements PausableTimeout {
  #callback: () => void;
  #remaining: number;
  #start?: number;
  #timeoutId!: number; // the setPausable timout populates this when it calls `this.resume`

  constructor(callback: () => void, delay: number) {
    this.#callback = callback;
    this.#remaining = delay;
  }

  getTimeoutId() {
    return this.#timeoutId;
  }

  resume() {
    this.#start = Date.now();

    window.clearTimeout(this.#timeoutId);

    this.#timeoutId = window.setTimeout(this.#callback, this.#remaining);
  }

  pause() {
    if (this.#start === undefined) {
      return this.#remaining;
    }

    window.clearTimeout(this.#timeoutId);

    this.#remaining -= Date.now() - this.#start;

    return this.#remaining;
  }
}

export function setPausableTimeout(
  callback: () => void,
  delay: number,
): PausableTimeout {
  const timeout = new Timeout(callback, delay);

  timeout.resume();

  return {
    getTimeoutId: timeout.getTimeoutId.bind(timeout),
    pause: timeout.pause.bind(timeout),
    resume: timeout.resume.bind(timeout),
  };
}
