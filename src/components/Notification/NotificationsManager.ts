import { ReactNode } from 'react';
import { generateUniqueId } from '../../hooks';
import { ObservableState, Observable, filterByField } from '../../utils';

export type DefaultNotificationType = 'info' | 'success' | 'warn' | 'danger';

export interface NotificationManagerConfig<T extends string> {
  /**
   * @default ['info', 'success', 'warn', 'danger']
   */
  types: T[];
  /**
   * @default 2
   */
  limit?: number;
  /**
   * @default 6000
   */
  delay?: number;
}

export type NotificationStatus = 'inactive' | 'active';

export type NotificationMetadata = Record<PropertyKey, unknown>;

export type NotificationData<
  T extends string,
  M extends NotificationMetadata,
> = {
  id: string;
  message: ReactNode;
  type: T;
  delay?: number;
} & M;

export type ActiveNotificationData<
  T extends string,
  M extends NotificationMetadata,
> = NotificationData<T, M> & {
  status: NotificationStatus;
};

export type NotifyOptions<M extends NotificationMetadata> = {
  delay?: number;
} & M;

export type Notify<M extends NotificationMetadata> = (
  message: ReactNode,
  options?: NotifyOptions<M>,
) => void;

export const DEFAULT_NOTIFICATION_DELAY = 6000;

export interface NotificationsController<
  T extends string = DefaultNotificationType,
  M extends NotificationMetadata = Record<never, never>,
> {
  readonly activeNotificationQueue: Observable<ActiveNotificationData<T, M>[]>;
  readonly config: Required<NotificationManagerConfig<T>>;
  add: (data: Omit<NotificationData<T, M>, 'id'>) => void;
  update: (
    data: Partial<ActiveNotificationData<T, M>> & { id: string },
  ) => void;
  remove: (id: string) => void;
  cancel: (id: string) => void;
  clear: (option?: { all: boolean }) => void;
}

export interface NotificationManger<
  T extends string,
  M extends NotificationMetadata = Record<never, never>,
> {
  notifier: Record<T, Notify<M>>;
  controller: NotificationsController<T, M>;
}

class Controller<
  T extends string = DefaultNotificationType,
  M extends NotificationMetadata = Record<never, never>,
> implements NotificationsController<T, M>
{
  #pendingNotificationQueue: NotificationData<T, M>[] = [];
  readonly activeNotificationQueue = new ObservableState<
    ActiveNotificationData<T, M>[]
  >([]);

  readonly config: Required<NotificationManagerConfig<T>>;

  constructor(config?: NotificationManagerConfig<T>) {
    this.config = {
      types: config?.types || (['info', 'success', 'warn', 'danger'] as T[]),
      limit: config?.limit ?? 2,
      delay: config?.delay ?? DEFAULT_NOTIFICATION_DELAY,
    };
  }

  add(data: Omit<NotificationData<T, M>, 'id'>) {
    const id = generateUniqueId('toast');

    const notification = {
      ...data,
      id,
      message: data.message,
      type: data.type,
      delay: data.delay ?? this.config.delay,
    } as NotificationData<T, M>;

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
    updatedNotification: Partial<ActiveNotificationData<T, M>> & { id: string },
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
          M
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

  #removeNotification = <N extends NotificationData<T, M>>(
    notifications: N[],
    notificationId: string,
  ): N[] => filterByField(notifications, 'id', notificationId);

  #isActiveNotification = (id: string) =>
    this.activeNotificationQueue.value.some(
      (notification) => notification.id === id,
    );
}

export function createNotificationManager<
  T extends DefaultNotificationType = DefaultNotificationType,
  M extends NotificationMetadata = Record<never, never>,
>(config?: NotificationManagerConfig<T>): NotificationManger<T, M>;
export function createNotificationManager<
  T extends string,
  M extends NotificationMetadata = Record<never, never>,
>(config: NotificationManagerConfig<T>): NotificationManger<T, M>;
export function createNotificationManager<
  T extends string,
  M extends NotificationMetadata = Record<never, never>,
>(config?: NotificationManagerConfig<T>): NotificationManger<T, M> {
  const controller = new Controller<T, M>(config);

  const notifier = controller.config.types.reduce<Record<T, Notify<M>>>(
    (acc, type) => ({
      ...acc,
      [type]: (message: ReactNode, options?: NotifyOptions<M>) => {
        const notification = {
          message,
          type,
          ...options,
        } as NotificationData<T, M>;

        controller.add(notification);
      },
    }),
    {} as never,
  );

  return { notifier, controller };
}
