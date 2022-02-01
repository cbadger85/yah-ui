import { ReactNode } from 'react';
import { generateUniqueId } from '../../hooks';
import {
  Store,
  filterByField,
  setPausableTimeout,
  Listener,
  Unsubscriber,
} from '../../utils';

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

export type AdditionalNotificationProps = Record<PropertyKey, unknown>;

export type NotificationData<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
> = {
  /**
   * The generated id of the notification.
   */
  id: string;
  /**
   * The message to be sent.
   */
  message: ReactNode;
  /**
   * The type of message eg. "info", "warn", "error".
   * */
  type: T;
  /**
   * Time in ms the notification should be displayed. This will override the
   * delay in the config.
   */
  delay?: number;
} & P;

export type ActiveNotificationData<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
> = NotificationData<T, P> & {
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

export interface NotificationManager<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
> {
  /**
   * The list of active notifications
   */
  readonly notifications: ActiveNotificationData<T, P>[];
  /**
   * Subscribe to changes in active notifications. The listener
   * callback will be called every time `notifications` has changed.
   */
  subscribe: (
    listener: Listener<ActiveNotificationData<T, P>[]>,
  ) => Unsubscriber;
  /**
   * Add a new notification. If the active queue is at the limit set in the config,
   * then it will add the notification to the pending queue.
   *
   * @returns Id of the created notification
   */
  add: (data: Omit<NotificationData<T, P>, 'id'>) => string;
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

class Manager<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
> implements NotificationManager<T, P>
{
  #pendingNotificationQueue: NotificationData<T, P>[] = [];
  readonly #activeNotificationQueue = new Store<ActiveNotificationData<T, P>[]>(
    [],
  );
  readonly #config: Required<NotificationManagerConfig>;

  get notifications() {
    return this.#activeNotificationQueue.value;
  }

  subscribe(listener: Listener<ActiveNotificationData<T, P>[]>): Unsubscriber {
    return this.#activeNotificationQueue.subscribe(listener);
  }

  constructor(config?: NotificationManagerConfig) {
    this.#config = {
      limit: config?.limit ?? 2,
      delay: config?.delay ?? DEFAULT_NOTIFICATION_DELAY,
      static: false,
    };
  }

  unmount(id: string) {
    const notifications = this.#activeNotificationQueue.value;

    const activeNotifications = notifications.filter(
      (notification) => notification.id !== id,
    );

    if (activeNotifications.length < notifications.length) {
      this.#activeNotificationQueue.setValue(activeNotifications);
    }
  }

  add(data: Omit<NotificationData<T, P>, 'id'>) {
    const id = generateUniqueId('toast');

    const notification = {
      ...data,
      id,
      message: data.message,
      type: data.type,
      delay: data.delay ?? this.#config.delay,
    } as NotificationData<T, P>;

    if (this.#activeNotificationQueue.value.length < this.#config.limit) {
      this.#addActiveNotification(notification);
    } else {
      this.#pendingNotificationQueue = [
        ...this.#pendingNotificationQueue,
        notification,
      ];
    }

    return id;
  }

  #addActiveNotification(notification: NotificationData<T, P>) {
    const delay = notification.delay ?? this.#config.delay;

    const { pause, resume, isPaused } = setPausableTimeout(() => {
      this.#removeActiveNotification(notification.id);
    }, notification.delay ?? DEFAULT_NOTIFICATION_DELAY);

    this.#activeNotificationQueue.setValue([
      ...this.#activeNotificationQueue.value,
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

  #removeActiveNotification(id: string) {
    const activeNotifications = this.#activeNotificationQueue.value.map(
      (notification) =>
        notification.id === id
          ? { ...notification, status: 'inactive' }
          : notification,
    ) as ActiveNotificationData<T, P>[];

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
      } as ActiveNotificationData<T, P>);

      this.#pendingNotificationQueue = updatedNotificationQueue;
    }
  }

  remove(id: string) {
    if (this.#isActiveNotification(id)) {
      return this.#removeActiveNotification(id);
    }

    const filteredPendingNotifications = this.#filterNotificationQueueById(
      this.#pendingNotificationQueue,
      id,
    );

    this.#pendingNotificationQueue = filteredPendingNotifications;
  }

  clear(options?: { all: boolean }) {
    if (options?.all) {
      this.#activeNotificationQueue.setValue([]);
    }
    this.#pendingNotificationQueue = [];
  }

  #filterNotificationQueueById = <N extends NotificationData<T, P>>(
    notifications: N[],
    notificationId: string,
  ): N[] => filterByField(notifications, 'id', notificationId);

  #isActiveNotification = (id: string) =>
    this.#activeNotificationQueue.value.some(
      (notification) => notification.id === id,
    );
}

export function createNotificationManager<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
>(config?: NotificationManagerConfig): NotificationManager<T, P> {
  const manager = new Manager<T, P>(config);

  return {
    add: manager.add.bind(manager),
    clear: manager.clear.bind(manager),
    remove: manager.remove.bind(manager),
    unmount: manager.unmount.bind(manager),
    subscribe: manager.subscribe.bind(manager),
    notifications: manager.notifications,
  };
}
