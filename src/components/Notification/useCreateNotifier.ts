import { ReactNode, useMemo } from 'react';
import { generateUniqueId } from '../../hooks';
import { Observable } from '../../utils/Observer';

export type DefaultNotificationType = 'info' | 'success' | 'warn' | 'danger';

export interface NotifierConfig<T extends string> {
  types: T[];
  limit?: number;
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

export class NotificationController<
  T extends string = DefaultNotificationType,
  M extends NotificationMetadata = Record<never, never>,
> {
  #pendingNotificationQueue: NotificationData<T, M>[] = [];
  readonly activeNotificationQueue = new Observable<
    ActiveNotificationData<T, M>[]
  >([]);

  readonly config: Required<NotifierConfig<T>>;

  constructor(config?: NotifierConfig<T>) {
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
    updatedNotification: Partial<NotificationData<T, M>> & { id: string },
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
      this.#pendingNotificationQueue = this.#pendingNotificationQueue.map(
        (notification) =>
          notification.id === updatedNotification.id
            ? { ...notification, ...updatedNotification }
            : notification,
      );
    }
  }

  remove(id: string) {
    const updatedActiveNotifications =
      this.activeNotificationQueue.value.filter(
        this.#notificationPredicate(id),
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

    const filteredPendingNotifications = this.#pendingNotificationQueue.filter(
      this.#notificationPredicate(id),
    );

    this.#pendingNotificationQueue = filteredPendingNotifications;
  }

  clear() {
    this.activeNotificationQueue.setValue([]);
    this.#pendingNotificationQueue = [];
  }

  #notificationPredicate =
    (id: string) => (notification: NotificationData<T, M>) =>
      notification.id !== id;

  #isActiveNotification = (id: string) =>
    this.activeNotificationQueue.value.some(
      (notification) => notification.id === id,
    );
}

function buildNotifier<T extends string, M extends NotificationMetadata>(
  controller: NotificationController<T, M>,
) {
  return controller.config.types.reduce<Record<T, Notify<M>>>(
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
}

export function createNotifier<
  T extends string,
  M extends NotificationMetadata = Record<never, never>,
>(
  config?: NotifierConfig<T>,
): {
  notifier: Record<T, Notify<M>>;
  controller: NotificationController<T, M>;
} {
  const controller = new NotificationController<T, M>(config);

  const notifier = buildNotifier<T, M>(controller);

  return { notifier, controller };
}

export function useCreateNotifier<
  T extends string,
  M extends NotificationMetadata = Record<never, never>,
>(
  config?: NotifierConfig<T>,
): {
  notifier: Record<T, Notify<M>>;
  controller: NotificationController<T, M>;
} {
  return useMemo(() => createNotifier<T, M>(config), [config]);
}
