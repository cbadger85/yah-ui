import { renderHook, act } from '@testing-library/react-hooks';
import { useAlerts, isAlertManager } from './useAlerts';
import { createAlertManager } from './AlertManager';

afterEach(() => {
  jest.useRealTimers();
});

describe('useAlerts', () => {
  it('should create an AlertManager with default options if no config is provided', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useAlerts());

    const message = 'test message';
    let testId = '';

    await act(async () => {
      testId = result.current.add({ message });
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts).toContainEqual(
      expect.objectContaining({
        id: testId,
        message,
        status: 'active',
        duration: 6000,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(6000);
    });

    expect(result.current.alerts).toHaveLength(0);
  });

  it('should create an AlertManager with the provided options if a config is provided', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() =>
      useAlerts({ duration: 4000, static: true }),
    );

    const message = 'test message';
    let testId = '';

    await act(async () => {
      testId = result.current.add({ message });
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts).toContainEqual(
      expect.objectContaining({
        id: testId,
        message,
        status: 'active',
        duration: 4000,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts).toContainEqual(
      expect.objectContaining({
        id: testId,
        message,
        status: 'inactive',
        duration: 4000,
      }),
    );
  });

  it('should wrap an already created AlertManager with the hook if an instance of AlertManager is provided', async () => {
    jest.useFakeTimers();

    const manager = createAlertManager({ duration: 4000, static: true });

    const { result } = renderHook(() => useAlerts(manager));

    const message = 'test message';

    let testId = '';

    await act(async () => {
      testId = manager.add({ message });
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts).toContainEqual(
      expect.objectContaining({
        id: testId,
        message,
        status: 'active',
        duration: 4000,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts).toContainEqual(
      expect.objectContaining({
        id: testId,
        message,
        status: 'inactive',
        duration: 4000,
      }),
    );
  });

  it('should update the config if the options for the config are changed after the hook is created', async () => {
    const manager = createAlertManager();

    const { result } = renderHook(() => useAlerts(manager));

    const message1 = 'test message';

    let messageId1 = '';

    await act(async () => {
      messageId1 = manager.add({ message: message1 });
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts).toContainEqual(
      expect.objectContaining({
        id: messageId1,
        message: message1,
        duration: 6000,
      }),
    );

    await act(async () => {
      manager.configure({ duration: 4000 });
    });

    const message2 = 'test message';

    let messageId2 = '';

    await act(async () => {
      messageId2 = manager.add({ message: message2 });
    });

    expect(result.current.alerts).toHaveLength(2);
    expect(result.current.alerts).toContainEqual(
      expect.objectContaining({
        id: messageId1,
        message: message1,
        duration: 6000,
      }),
    );
    expect(result.current.alerts).toContainEqual(
      expect.objectContaining({
        id: messageId2,
        message: message2,
        duration: 4000,
      }),
    );
  });
});

describe('isAlertManager', () => {
  it('should return true if an alert manager is passed in', () => {
    const manager = createAlertManager();

    expect(isAlertManager(manager)).toBeTruthy();
    expect(isAlertManager({})).toBeFalsy();
    expect(
      isAlertManager({ duration: 4000, static: true, limit: 2 }),
    ).toBeFalsy();
  });
});
