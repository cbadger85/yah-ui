export interface PausableTimeout {
  timeoutId: number;
  resume: () => void;
  /**
   * @returns the time remaining for the timeout.
   */
  pause: () => number;
  isPaused: boolean;
}

class Timeout implements PausableTimeout {
  #callback: () => void;
  #remaining: number;
  #start?: number;
  timeoutId!: number; // the setPausable timout populates this when it calls `this.resume`
  isPaused = false;

  constructor(callback: () => void, delay: number) {
    this.#callback = callback;
    this.#remaining = delay;
  }

  resume() {
    this.isPaused = false;
    this.#start = Date.now();

    window.clearTimeout(this.timeoutId);

    this.timeoutId = window.setTimeout(this.#callback, this.#remaining);
  }

  pause() {
    this.isPaused = true;
    if (this.#start === undefined) {
      return this.#remaining;
    }

    window.clearTimeout(this.timeoutId);

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
    timeoutId: timeout.timeoutId,
    isPaused: timeout.isPaused,
    pause: timeout.pause.bind(timeout),
    resume: timeout.resume.bind(timeout),
  };
}
