import { ReactNode } from 'react';
import { generateUniqueId } from '../../hooks';
import { Store, ReactiveStore, filterByField } from '../../utils';

export type DefaultNotificationType = 'info' | 'success' | 'warn' | 'danger';

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
}

/**
 * The status of the active notification
 */
export type NotificationStatus = 'inactive' | 'active';

export type AdditionalNotificationProps = Record<PropertyKey, unknown>;

export type NotificationData<
  T extends string = DefaultNotificationType,
  P extends AdditionalNotificationProps = Record<never, never>,
> = {
  id: string;
  message: ReactNode;
  type: T;
  delay?: number;
} & P;

export type ActiveNotificationData<
  T extends string = DefaultNotificationType,
  P extends AdditionalNotificationProps = Record<never, never>,
> = NotificationData<T, P> & {
  status: NotificationStatus;
};

export const DEFAULT_NOTIFICATION_DELAY = 6000;

export interface NotificationManager<
  T extends string = DefaultNotificationType,
  P extends AdditionalNotificationProps = Record<never, never>,
> {
  readonly activeNotificationQueue: ReactiveStore<
    ActiveNotificationData<T, P>[]
  >;
  /**
   * @returns Id of the created notification
   */
  add: (data: Omit<NotificationData<T, P>, 'id'>) => string;
  update: (
    data: Partial<ActiveNotificationData<T, P>> & { id: string },
  ) => void;
  remove: (id: string) => void;
  cancel: (id: string) => void;
  clear: (option?: { all: boolean }) => void;
}

class Manager<
  T extends string = DefaultNotificationType,
  P extends AdditionalNotificationProps = Record<never, never>,
> implements NotificationManager<T, P>
{
  #pendingNotificationQueue: NotificationData<T, P>[] = [];
  readonly activeNotificationQueue = new Store<ActiveNotificationData<T, P>[]>(
    [],
  );

  readonly #config: Required<NotificationManagerConfig>;

  constructor(config?: NotificationManagerConfig) {
    this.#config = {
      limit: config?.limit ?? 2,
      delay: config?.delay ?? DEFAULT_NOTIFICATION_DELAY,
    };
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

    if (this.activeNotificationQueue.value.length < this.#config.limit) {
      this.activeNotificationQueue.setValue([
        ...this.activeNotificationQueue.value,
        { ...notification, status: 'active' },
      ]);
    } else {
      this.#pendingNotificationQueue = [
        ...this.#pendingNotificationQueue,
        notification,
      ];
    }

    return id;
  }

  update(
    updatedNotification: Partial<ActiveNotificationData<T, P>> & { id: string },
  ) {
    if (this.#isActiveNotification(updatedNotification.id)) {
      this.activeNotificationQueue.setValue(
        this.activeNotificationQueue.value.map((notification) =>
          notification.id === updatedNotification.id
            ? { ...notification, ...updatedNotification }
            : notification,
        ),
      );
    } else {
      const { status, ...updatedPendingNotification } = updatedNotification;
      this.#pendingNotificationQueue = this.#pendingNotificationQueue.map(
        (notification) =>
          notification.id === updatedPendingNotification.id
            ? { ...notification, ...updatedPendingNotification }
            : notification,
      );
    }
  }

  remove(id: string) {
    const updatedActiveNotifications = this.#removeNotification(
      this.activeNotificationQueue.value,
      id,
    );

    if (
      updatedActiveNotifications.length ===
      this.activeNotificationQueue.value.length
    ) {
      return; // No notifications were removed, so we should do nothing
    }

    if (this.#pendingNotificationQueue.length) {
      const [nextNotification, ...updatedNotificationQueue] =
        this.#pendingNotificationQueue;

      this.activeNotificationQueue.setValue([
        ...updatedActiveNotifications,
        { ...nextNotification, status: 'active' } as ActiveNotificationData<
          T,
          P
        >,
      ]);
      this.#pendingNotificationQueue = updatedNotificationQueue;
    } else {
      this.activeNotificationQueue.setValue(updatedActiveNotifications);
    }
  }

  cancel(id: string) {
    if (this.#isActiveNotification(id)) {
      return this.remove(id);
    }

    const filteredPendingNotifications = this.#removeNotification(
      this.#pendingNotificationQueue,
      id,
    );

    this.#pendingNotificationQueue = filteredPendingNotifications;
  }

  clear(options?: { all: boolean }) {
    if (options?.all) {
      this.activeNotificationQueue.setValue([]);
    }
    this.#pendingNotificationQueue = [];
  }

  #removeNotification = <N extends NotificationData<T, P>>(
    notifications: N[],
    notificationId: string,
  ): N[] => filterByField(notifications, 'id', notificationId);

  #isActiveNotification = (id: string) =>
    this.activeNotificationQueue.value.some(
      (notification) => notification.id === id,
    );
}

export function createNotificationManager<
  T extends string = DefaultNotificationType,
  P extends AdditionalNotificationProps = Record<never, never>,
>(config?: NotificationManagerConfig): NotificationManager<T, P> {
  const manager = new Manager<T, P>(config);

  return {
    add: manager.add.bind(manager),
    cancel: manager.cancel.bind(manager),
    clear: manager.clear.bind(manager),
    remove: manager.remove.bind(manager),
    update: manager.update.bind(manager),
    activeNotificationQueue: manager.activeNotificationQueue,
  };
}
