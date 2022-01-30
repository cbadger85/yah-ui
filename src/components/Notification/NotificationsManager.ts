import { ReactNode } from 'react';
import { generateUniqueId } from '../../hooks';
import { Store, ReactiveStore, filterByField } from '../../utils';

export type DefaultNotificationType = 'info' | 'success' | 'warn' | 'danger';

export interface NotificationManagerConfig<T extends string> {
  /**
   * The types of notifications that should be emitted.
   *
   * @default ['info', 'success', 'warn', 'danger']
   */
  types: T[];
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
  T extends string,
  P extends AdditionalNotificationProps,
> = {
  id: string;
  message: ReactNode;
  type: T;
  delay?: number;
} & P;

export type ActiveNotificationData<
  T extends string,
  P extends AdditionalNotificationProps,
> = NotificationData<T, P> & {
  status: NotificationStatus;
};

export type NotifyOptions<P extends AdditionalNotificationProps> = {
  delay?: number;
} & P;

export type Notify<M extends AdditionalNotificationProps> = (
  message: ReactNode,
  options?: NotifyOptions<Partial<M>>,
) => void;

export const DEFAULT_NOTIFICATION_DELAY = 6000;

export interface NotificationsController<
  T extends string = DefaultNotificationType,
  P extends AdditionalNotificationProps = Record<never, never>,
> {
  readonly activeNotificationQueue: ReactiveStore<
    ActiveNotificationData<T, P>[]
  >;
  readonly config: Required<NotificationManagerConfig<T>>;
  add: (data: Omit<NotificationData<T, P>, 'id'>) => void;
  update: (
    data: Partial<ActiveNotificationData<T, P>> & { id: string },
  ) => void;
  remove: (id: string) => void;
  cancel: (id: string) => void;
  clear: (option?: { all: boolean }) => void;
}

export interface NotificationManger<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
> {
  notifier: Record<T, Notify<P>>;
  controller: NotificationsController<T, P>;
}

class Controller<
  T extends string = DefaultNotificationType,
  P extends AdditionalNotificationProps = Record<never, never>,
> implements NotificationsController<T, P>
{
  #pendingNotificationQueue: NotificationData<T, P>[] = [];
  readonly activeNotificationQueue = new Store<ActiveNotificationData<T, P>[]>(
    [],
  );

  readonly config: Required<NotificationManagerConfig<T>>;

  constructor(config?: NotificationManagerConfig<T>) {
    this.config = {
      types: config?.types || (['info', 'success', 'warn', 'danger'] as T[]),
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
      delay: data.delay ?? this.config.delay,
    } as NotificationData<T, P>;

    if (this.activeNotificationQueue.value.length < this.config.limit) {
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
  P extends AdditionalNotificationProps = Record<never, never>,
>(
  config?: NotificationManagerConfig<DefaultNotificationType>,
): NotificationManger<DefaultNotificationType, P>;
export function createNotificationManager<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
>(config: NotificationManagerConfig<T>): NotificationManger<T, P>;
export function createNotificationManager<
  T extends string,
  P extends AdditionalNotificationProps = Record<never, never>,
>(config?: NotificationManagerConfig<T>): NotificationManger<T, P> {
  const controller = new Controller<T, P>(config);

  const notifier = controller.config.types.reduce<Record<T, Notify<P>>>(
    (acc, type) => ({
      ...acc,
      [type]: (message: ReactNode, options?: NotifyOptions<P>) => {
        const notification = {
          message,
          type,
          ...options,
        } as NotificationData<T, P>;

        controller.add(notification);
      },
    }),
    {} as never,
  );

  return { notifier, controller };
}
