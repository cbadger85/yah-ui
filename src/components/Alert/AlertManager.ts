import { generateUniqueId } from '../../hooks';
import {
  Store,
  setPausableTimeout,
  Listener,
  Unsubscriber,
  warning,
} from '../../utils';

export interface AlertManagerConfig {
  /**
   * The total number of alerts that should be displayed at once.
   *
   * @default 2
   */
  limit?: number;
  /**
   * Time in ms the alert should be displayed. A value of Infinity
   * will be ignored and replaced with a 0.
   *
   * @default 6000
   */
  duration?: number;
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
   * duration in the config.
   */
  duration?: number;
};

export type ActiveAlertData<M = string, T extends string = string> = AlertData<
  M,
  T
> & {
  /**
   * The duration from `manager.add` or, if not provided, the duration from the config.
   * A value of Infinity will be ignored and replaced with a 0.
   */
  readonly duration: number;
  /**
   * The status of the active alert.
   */
  readonly status: 'inactive' | 'active';
  /**
   * `true` if the current alert is paused.
   */
  readonly isPaused: boolean;
  /**
   * Pauses the alert's duration timer.
   *
   * @returns The time remaining on the alert's duration timer.
   */
  pause: () => number;
  /**
   * Resumes the alert's duration timer.
   */
  resume: () => void;
  /**
   * If `config.static` is `true`, then sets the alert status to `inactive`.
   * Otherwise, removes the alert.
   */
  close: () => void;
};

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
   * Updates the config of the AlertManager after it has been created. The
   * changes will be applied to all new alerts added to the active queue.
   */
  configure: (config?: AlertManagerConfig) => void;
  /**
   * Finds the active alert by id, and removes it. Pending alert ids
   * will be ignored. This will ignore the static property in the config and
   * always remove the active alert.
   *
   */
  unmount: (alertId: string) => void;
}

const DEFAULT_CONFIG: Required<AlertManagerConfig> = {
  duration: 6000,
  limit: 2,
  static: false,
};

class Manager<M, T extends string> implements AlertManager<M, T> {
  #pendingAlertQueue: AlertData<M, T>[] = [];
  readonly #activeAlertQueue = new Store<ActiveAlertData<M, T>[]>([]);
  #config: Required<AlertManagerConfig>;

  constructor(config?: AlertManagerConfig) {
    this.#config = Manager.buildConfig(config);
  }

  private static buildConfig(
    config: AlertManagerConfig | undefined,
    baseConfig = DEFAULT_CONFIG,
  ): Required<AlertManagerConfig> {
    return {
      limit: config?.limit ?? baseConfig.limit,
      duration:
        config?.duration === Infinity
          ? 0
          : config?.duration ?? baseConfig.duration,
      static: config?.static ?? baseConfig.static,
    };
  }

  add(alert: Omit<AlertData<M, T>, 'id'>) {
    const id = generateUniqueId('toast');

    const newAlert: AlertData<M, T> = { ...alert, id };

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

  configure(config?: AlertManagerConfig) {
    this.#config = Manager.buildConfig(config, this.#config);
  }

  getAlerts() {
    return this.#activeAlertQueue.getValue();
  }

  remove(id: string) {
    if (this.#isActiveAlert(id)) {
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
    if (!this.#isActiveAlert(id)) {
      return;
    }

    const activeAlerts = this.getAlerts().filter((alert) => alert.id !== id);

    this.#activeAlertQueue.setValue(activeAlerts);

    if (this.#pendingAlertQueue.length) {
      const [nextAlert, ...updatedAlertQueue] = this.#pendingAlertQueue;

      this.#addActiveAlert({
        ...nextAlert,
        status: 'active',
      } as ActiveAlertData<M, T>);

      this.#pendingAlertQueue = updatedAlertQueue;
    }
  }

  #addActiveAlert(alert: AlertData<M, T>) {
    warning(
      alert.duration !== Infinity || this.#config.duration !== Infinity,
      'A duration of Infinity will be treated as 0',
    );

    const duration =
      (alert.duration === Infinity ? 0 : alert.duration) ??
      (this.#config.duration === Infinity ? 0 : this.#config.duration);

    const { pause, resume, isPaused } = setPausableTimeout(() => {
      this.#removeActiveAlert(alert.id);
    }, duration);

    this.#activeAlertQueue.setValue([
      ...this.getAlerts(),
      {
        ...alert,
        status: 'active',
        duration,
        pause,
        resume,
        close: () => this.remove(alert.id),
        isPaused,
      },
    ]);
  }

  #isActiveAlert(id: string) {
    return this.getAlerts().some((alert) => id === alert.id);
  }

  #removeActiveAlert(id: string) {
    if (!this.#isActiveAlert(id)) {
      return;
    }

    const activeAlerts = this.getAlerts().map((alert) =>
      alert.id === id ? { ...alert, status: 'inactive' } : alert,
    ) as ActiveAlertData<M, T>[];

    this.#activeAlertQueue.setValue(activeAlerts);

    if (!this.#config.static) {
      this.unmount(id);
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
    configure: manager.configure.bind(manager),
    remove: manager.remove.bind(manager),
    unmount: manager.unmount.bind(manager),
    subscribe: manager.subscribe.bind(manager),
    getAlerts: manager.getAlerts.bind(manager),
  };
}
