import { setPausableTimeout } from './PausableTimeout';

afterEach(() => {
  jest.useRealTimers();
});

describe('setPausableTimeout', () => {
  it('should call the callback after the delay', () => {
    jest.useFakeTimers();

    const callback = jest.fn();
    const delay = 3000;

    setPausableTimeout(callback, delay);

    jest.advanceTimersByTime(3000);

    expect(callback).toBeCalled();
  });

  describe('PauseableTimout', () => {
    describe('getTimeoutId', () => {
      it('should cancel the timeout when globalThis.clearTimeout is called with the timeoutId', () => {
        jest.useFakeTimers();

        const callback = jest.fn();
        const delay = 3000;

        const timeout = setPausableTimeout(callback, delay);

        clearTimeout(timeout.getTimeoutId());

        jest.runAllTimers();

        expect(callback).not.toBeCalled();
      });

      it('should cancel the timeout when globalThis.clearTimeout is called with the timeoutId after having been paused and resumed', () => {
        jest.useFakeTimers();

        const callback = jest.fn();
        const delay = 3000;

        const timeout = setPausableTimeout(callback, delay);

        jest.advanceTimersByTime(1000);

        timeout.pause();

        timeout.resume();

        clearTimeout(timeout.getTimeoutId());

        jest.runOnlyPendingTimers();

        expect(callback).not.toBeCalled();
      });
    });

    describe('pause', () => {
      it('should return the time left on the timeout', () => {
        jest.useFakeTimers();

        const callback = jest.fn();
        const delay = 3000;

        const timeout = setPausableTimeout(callback, delay);

        jest.advanceTimersByTime(1000);

        const timeRemaining = timeout.pause();

        expect(timeRemaining).toBe(2000);
      });

      it('should return the time left on the timeout if pause is called on a paused timeout', () => {
        jest.useFakeTimers();

        const callback = jest.fn();
        const delay = 3000;

        const timeout = setPausableTimeout(callback, delay);

        jest.advanceTimersByTime(1000);

        const timeRemaining1 = timeout.pause();
        expect(timeRemaining1).toBe(2000);

        jest.advanceTimersByTime(1000);

        const timeRemaining2 = timeout.pause();

        expect(timeRemaining2).toBe(timeRemaining1);

        timeout.resume();

        jest.advanceTimersByTime(2000);
        expect(callback).toBeCalled();
      });
    });

    describe('resume', () => {
      it('should resume the timeout after being paused', () => {
        jest.useFakeTimers();

        const callback = jest.fn();
        const delay = 3000;

        const timeout = setPausableTimeout(callback, delay);

        jest.advanceTimersByTime(1000);

        timeout.pause();

        timeout.resume();

        jest.advanceTimersByTime(2000);

        expect(callback).toBeCalled();
      });

      it('should do nothing if resume is called on an active timeout', () => {
        jest.useFakeTimers();

        const callback = jest.fn();
        const delay = 3000;

        const timeout = setPausableTimeout(callback, delay);

        jest.advanceTimersByTime(1000);

        timeout.resume();

        jest.advanceTimersByTime(2000);

        expect(callback).toBeCalled();
      });
    });
  });
});
