import { generateUniqueId } from '../../hooks';
import { Store, setPausableTimeout, Listener, Unsubscriber } from '../../utils';

export interface AlertManagerConfig {
  /**
   * The total number of alerts that should be displayed at once.
   *
   * @default 2
   */
  limit?: number;
  /**
   * Time in ms the alert should be displayed.
   *
   * @default 6000
   */
  delay?: number;
  /**
   * If true, the manager will not remove the alert when the status
   * is changed to `inactive`.
   *
   * @default false
   */
  static?: boolean;
}

export type AlertData<M = string, T extends string = string> = {
  /**
   * The generated id of the alert.
   */
  id: string;
  /**
   * The message to be sent.
   */
  message: M;
  /**
   * The type of alrt eg. "info", "warn", "error".
   * */
  type: T;
  /**
   * Time in ms the alert should be displayed. This will override the
   * delay in the config.
   */
  delay?: number;
};

export type ActiveAlertData<M = string, T extends string = string> = AlertData<
  M,
  T
> & {
  /**
   * The delay from `manager.add` or, if not provided, the delay from the config
   */
  readonly delay: number;
  /**
   * The status of the active alert
   */
  readonly status: 'inactive' | 'active';
  /**
   * `true` if the current alert is paused
   */
  readonly isPaused: boolean;
  /**
   * Pauses the alert's delay timer.
   *
   * @returns The time remaining on the alert's delay timer.
   */
  pause: () => number;
  /**
   * Resumes the alert's delay timer.
   */
  resume: () => void;
  /**
   * If `config.static` is `true`, then sets the alert status to `inactive`.
   * Otherwise, removes the alert.
   */
  close: () => void;
};

export const DEFAULT_ALERT_DELAY = 6000;

export interface AlertManager<M = string, T extends string = string> {
  /**
   * Get the current list of active alerts
   */
  getAlerts: () => ActiveAlertData<M, T>[];
  /**
   * Subscribe to changes in active alerts.
   */
  subscribe: (listener: Listener<ActiveAlertData<M, T>[]>) => Unsubscriber;
  /**
   * Add a new alert. If the active queue is at the limit set in the config,
   * then it will add the alert to the pending queue.
   *
   * @returns Id of the created alert
   */
  add: (alert: Omit<AlertData<M, T>, 'id'>) => string;
  /**
   * Finds the alert by id and, if `config.static` is `true`, then sets the
   * alert status to `inactive`. Otherwise, removes the alert.
   */
  remove: (alertId: string) => void;
  /**
   * clears the pending alert queue. if `option.all` is set, clears both the
   * pending and active alert queues.
   *
   * @param option.all  clears both active and pending alert queues.
   */
  clear: (option?: { all: boolean }) => void;
  /**
   * Finds the active alert by id, and removes it. Pending alert ids
   * will be ignored.
   *
   * NOTE: This will ignore the static property in the config and always remove
   * the active alert.
   *
   */
  unmount: (alertId: string) => void;
}

class Manager<M, T extends string> implements AlertManager<M, T> {
  #pendingAlertQueue: AlertData<M, T>[] = [];
  readonly #activeAlertQueue = new Store<ActiveAlertData<M, T>[]>([]);
  readonly #config: Required<AlertManagerConfig>;

  constructor(config?: AlertManagerConfig) {
    this.#config = {
      limit: config?.limit ?? 2,
      delay: config?.delay ?? DEFAULT_ALERT_DELAY,
      static: !!config?.static,
    };
  }

  add(alert: Omit<AlertData<M, T>, 'id'>) {
    const id = generateUniqueId('toast');

    const newAlert = {
      ...alert,
      id,
      message: alert.message,
      type: alert.type,
      delay: alert.delay ?? this.#config.delay,
    } as AlertData<M, T>;

    if (this.getAlerts().length < this.#config.limit) {
      this.#addActiveAlert(newAlert);
    } else {
      this.#pendingAlertQueue = [...this.#pendingAlertQueue, newAlert];
    }

    return id;
  }

  clear(options?: { all: boolean }) {
    if (options?.all) {
      this.#activeAlertQueue.setValue([]);
    }
    this.#pendingAlertQueue = [];
  }

  getAlerts() {
    return this.#activeAlertQueue.getValue();
  }

  remove(id: string) {
    const isActiveAlert = this.getAlerts().some((alert) => alert.id === id);

    if (isActiveAlert) {
      return this.#removeActiveAlert(id);
    }

    const filteredPendingAlerts = this.#pendingAlertQueue.filter(
      (alert) => id !== alert.id,
    );

    this.#pendingAlertQueue = filteredPendingAlerts;
  }

  subscribe(listener: Listener<ActiveAlertData<M, T>[]>): Unsubscriber {
    return this.#activeAlertQueue.subscribe(listener);
  }

  unmount(id: string) {
    const alerts = this.getAlerts();

    const activeAlerts = alerts.filter((alert) => alert.id !== id);

    if (activeAlerts.length < alerts.length) {
      this.#activeAlertQueue.setValue(activeAlerts);
    }
  }

  #addActiveAlert(alert: AlertData<M, T>) {
    const delay = alert.delay ?? this.#config.delay;

    const { pause, resume, isPaused } = setPausableTimeout(() => {
      this.#removeActiveAlert(alert.id);
    }, alert.delay ?? DEFAULT_ALERT_DELAY);

    this.#activeAlertQueue.setValue([
      ...this.getAlerts(),
      {
        ...alert,
        status: 'active',
        delay,
        pause,
        resume,
        close: () => this.remove(alert.id),
        isPaused,
      },
    ]);
  }

  #removeActiveAlert(id: string) {
    const activeAlerts = this.getAlerts().map((alert) =>
      alert.id === id ? { ...alert, status: 'inactive' } : alert,
    ) as ActiveAlertData<M, T>[];

    this.#activeAlertQueue.setValue(activeAlerts);

    if (!this.#config.static) {
      this.unmount(id);
    }

    if (
      this.#pendingAlertQueue.length &&
      // 👇 I didn't think this needed to be here, but apparently, sometimes it does. hm...
      this.getAlerts().length < this.#config.limit
    ) {
      const [nextAlert, ...updatedAlertQueue] = this.#pendingAlertQueue;

      this.#addActiveAlert({
        ...nextAlert,
        status: 'active',
      } as ActiveAlertData<M, T>);

      this.#pendingAlertQueue = updatedAlertQueue;
    }
  }
}

export function createAlertManager<M = string, T extends string = string>(
  config?: AlertManagerConfig,
): AlertManager<M, T> {
  const manager = new Manager<M, T>(config);

  return {
    add: manager.add.bind(manager),
    clear: manager.clear.bind(manager),
    remove: manager.remove.bind(manager),
    unmount: manager.unmount.bind(manager),
    subscribe: manager.subscribe.bind(manager),
    getAlerts: manager.getAlerts.bind(manager),
  };
}
