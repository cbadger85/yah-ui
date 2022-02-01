import { generateUniqueId } from '../../hooks';
import { Store, setPausableTimeout, Listener, Unsubscriber } from '../../utils';

export interface NotificationManagerConfig {
  /**
   * The total number of notifications that should be displayed at once.
   *
   * @default 2
   */
  limit?: number;
  /**
   * Time in ms the notification should be displayed.
   *
   * @default 6000
   */
  delay?: number;
  /**
   * If true, the manager will not remove the component when the status
   * is changed to `inactive`.
   *
   * @default false
   */
  static?: boolean;
}

export type NotificationData<M, T extends string> = {
  /**
   * The generated id of the notification.
   */
  id: string;
  /**
   * The message to be sent.
   */
  message: M;
  /**
   * The type of message eg. "info", "warn", "error".
   * */
  type: T;
  /**
   * Time in ms the notification should be displayed. This will override the
   * delay in the config.
   */
  delay?: number;
};

export type ActiveNotificationData<M, T extends string> = NotificationData<
  M,
  T
> & {
  /**
   * The delay from `manager.add` or, if not provided, the delay from the config
   */
  readonly delay: number;
  /**
   * The status of the active notification
   */
  readonly status: 'inactive' | 'active';
  /**
   * `true` if the current notification is paused
   */
  readonly isPaused: boolean;
  /**
   * Pauses the notifications delay timer.
   *
   * @returns The time remaining on the notification delay timer.
   */
  pause: () => number;
  /**
   * Resumes the notification delay timer.
   */
  resume: () => void;
  /**
   * If `config.static` is `true`, then sets the notification status to `inactive`.
   * Otherwise, removes the notification.
   */
  close: () => void;
};

export const DEFAULT_NOTIFICATION_DELAY = 6000;

export interface NotificationManager<M, T extends string> {
  /**
   * Get the current list of active notifications
   */
  getNotifications: () => ActiveNotificationData<M, T>[];
  /**
   * Subscribe to changes in active notifications. The listener
   * callback will be called every time `notifications` has changed.
   */
  subscribe: (
    listener: Listener<ActiveNotificationData<M, T>[]>,
  ) => Unsubscriber;
  /**
   * Add a new notification. If the active queue is at the limit set in the config,
   * then it will add the notification to the pending queue.
   *
   * @returns Id of the created notification
   */
  add: (data: Omit<NotificationData<M, T>, 'id'>) => string;
  /**
   * Finds the notification by id and, if `config.static` is `true`, then sets the
   * notification status to `inactive`. Otherwise, removes the notification.
   */
  remove: (id: string) => void;
  /**
   * clears the pending notification queue. if `option.all` is set, clears both the
   * pending and active notification queues.
   *
   * @param option.all  clears both active and pending notification queues.
   */
  clear: (option?: { all: boolean }) => void;
  /**
   * Finds the active notification by id, and removes it. Pending notification ids
   * will be ignored.
   *
   * NOTE: This will ignore the static property in the config and always remove
   * the active notification.
   *
   */
  unmount: (id: string) => void;
}

class Manager<M, T extends string> implements NotificationManager<M, T> {
  #pendingNotificationQueue: NotificationData<M, T>[] = [];
  readonly #activeNotificationQueue = new Store<ActiveNotificationData<M, T>[]>(
    [],
  );
  readonly #config: Required<NotificationManagerConfig>;

  constructor(config?: NotificationManagerConfig) {
    this.#config = {
      limit: config?.limit ?? 2,
      delay: config?.delay ?? DEFAULT_NOTIFICATION_DELAY,
      static: false,
    };
  }

  getNotifications() {
    return this.#activeNotificationQueue.getValue();
  }

  subscribe(listener: Listener<ActiveNotificationData<M, T>[]>): Unsubscriber {
    return this.#activeNotificationQueue.subscribe(listener);
  }

  unmount(id: string) {
    const notifications = this.#activeNotificationQueue.getValue();

    const activeNotifications = notifications.filter(
      (notification) => notification.id !== id,
    );

    if (activeNotifications.length < notifications.length) {
      this.#activeNotificationQueue.setValue(activeNotifications);
    }
  }

  add(data: Omit<NotificationData<M, T>, 'id'>) {
    const id = generateUniqueId('toast');

    const notification = {
      ...data,
      id,
      message: data.message,
      type: data.type,
      delay: data.delay ?? this.#config.delay,
    } as NotificationData<M, T>;

    if (this.#activeNotificationQueue.getValue().length < this.#config.limit) {
      this.#addActiveNotification(notification);
    } else {
      this.#pendingNotificationQueue = [
        ...this.#pendingNotificationQueue,
        notification,
      ];
    }

    return id;
  }

  #addActiveNotification(notification: NotificationData<M, T>) {
    const delay = notification.delay ?? this.#config.delay;

    const { pause, resume, isPaused } = setPausableTimeout(() => {
      this.#removeActiveNotification(notification.id);
    }, notification.delay ?? DEFAULT_NOTIFICATION_DELAY);

    this.#activeNotificationQueue.setValue([
      ...this.#activeNotificationQueue.getValue(),
      {
        ...notification,
        status: 'active',
        delay,
        pause,
        resume,
        close: () => this.remove(notification.id),
        isPaused,
      },
    ]);
  }

  remove(id: string) {
    const isActiveNotification = this.#activeNotificationQueue
      .getValue()
      .some((notification) => notification.id === id);

    if (isActiveNotification) {
      return this.#removeActiveNotification(id);
    }

    const filteredPendingNotifications = this.#pendingNotificationQueue.filter(
      (notification) => id !== notification.id,
    );

    this.#pendingNotificationQueue = filteredPendingNotifications;
  }

  clear(options?: { all: boolean }) {
    if (options?.all) {
      this.#activeNotificationQueue.setValue([]);
    }
    this.#pendingNotificationQueue = [];
  }

  #removeActiveNotification(id: string) {
    const activeNotifications = this.#activeNotificationQueue
      .getValue()
      .map((notification) =>
        notification.id === id
          ? { ...notification, status: 'inactive' }
          : notification,
      ) as ActiveNotificationData<M, T>[];

    this.#activeNotificationQueue.setValue(activeNotifications);

    if (!this.#config.static) {
      this.unmount(id);
    }

    if (this.#pendingNotificationQueue.length) {
      const [nextNotification, ...updatedNotificationQueue] =
        this.#pendingNotificationQueue;

      this.#addActiveNotification({
        ...nextNotification,
        status: 'active',
      } as ActiveNotificationData<M, T>);

      this.#pendingNotificationQueue = updatedNotificationQueue;
    }
  }
}

export function createNotificationManager<M, T extends string>(
  config?: NotificationManagerConfig,
): NotificationManager<M, T> {
  const manager = new Manager<M, T>(config);

  return {
    add: manager.add.bind(manager),
    clear: manager.clear.bind(manager),
    remove: manager.remove.bind(manager),
    unmount: manager.unmount.bind(manager),
    subscribe: manager.subscribe.bind(manager),
    getNotifications: manager.getNotifications.bind(manager),
  };
}
