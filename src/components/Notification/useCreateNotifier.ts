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

export type NotificationData<T extends string> = {
  id: string;
  message: ReactNode;
  type: T;
  delay?: number;
};

export type ActiveNotificationData<T extends string> = NotificationData<T> & {
  status: NotificationStatus;
};

export interface NotificationController<
  Metadata extends Record<never, never> = Record<never, never>,
  NotificationType extends string = DefaultNotificationType,
  N extends NotificationData<NotificationType> = NotificationData<NotificationType> &
    Metadata,
  A extends N & { status: NotificationStatus } = N & {
    status: NotificationStatus;
  },
> {
  readonly activeNotificationQueue: Observable<A[]>;
  readonly config: Required<NotifierConfig<NotificationType>>;
  add: (data: Omit<N, 'id'>) => void;
  update: (data: Partial<N> & { id: string }) => void;
  remove: (id: string) => void;
  cancel: (id: string) => void;
  clear: () => void;
}

export interface NotifyOptions {
  delay?: number;
}

export type Notify<O extends NotifyOptions> = (
  message: ReactNode,
  options?: O,
) => void;

export const DEFAULT_NOTIFICATION_DELAY = 6000;

class Controller<
  Metadata extends Record<never, never> = Record<never, never>,
  NotificationType extends string = DefaultNotificationType,
  N extends NotificationData<NotificationType> = NotificationData<NotificationType> &
    Metadata,
  A extends N & { status: NotificationStatus } = N & {
    status: NotificationStatus;
  },
> implements NotificationController<Metadata, NotificationType, N, A>
{
  private pendingNotificationQueue: N[] = [];
  readonly activeNotificationQueue = new Observable<A[]>([]);

  readonly config: Required<NotifierConfig<NotificationType>>;

  constructor(config?: NotifierConfig<NotificationType>) {
    this.config = {
      types:
        config?.types ||
        (['info', 'success', 'warn', 'danger'] as NotificationType[]),
      limit: config?.limit ?? 2,
      delay: config?.delay ?? DEFAULT_NOTIFICATION_DELAY,
    };
  }

  add(data: Omit<N, 'id'>) {
    const id = generateUniqueId('toast');

    const notification = {
      ...data,
      id,
      message: data.message,
      type: data.type,
      delay: data.delay ?? this.config.delay,
    } as N;

    if (this.activeNotificationQueue.value.length < this.config.limit) {
      this.activeNotificationQueue.setValue([
        ...this.activeNotificationQueue.value,
        { ...notification, status: 'active' } as A,
      ]);
    } else {
      this.pendingNotificationQueue = [
        ...this.pendingNotificationQueue,
        notification,
      ];
    }
  }

  update(updatedNotification: Partial<N> & { id: string }) {
    if (this.isActiveNotification(updatedNotification.id)) {
      this.activeNotificationQueue.setValue(
        this.activeNotificationQueue.value.map((notification) =>
          notification.id === updatedNotification.id
            ? { ...notification, ...updatedNotification }
            : notification,
        ),
      );
    } else {
      this.pendingNotificationQueue = this.pendingNotificationQueue.map(
        (notification) =>
          notification.id === updatedNotification.id
            ? { ...notification, ...updatedNotification }
            : notification,
      );
    }
  }

  remove(id: string) {
    const updatedActiveNotifications =
      this.activeNotificationQueue.value.filter(this.filterNotification(id));

    if (this.pendingNotificationQueue.length) {
      const [nextNotification, ...updatedNotificationQueue] =
        this.pendingNotificationQueue;

      this.activeNotificationQueue.setValue([
        ...updatedActiveNotifications,
        { ...nextNotification, status: 'active' } as A,
      ]);
      this.pendingNotificationQueue = updatedNotificationQueue;
    } else {
      this.activeNotificationQueue.setValue(updatedActiveNotifications);
    }
  }

  cancel(id: string) {
    if (this.isActiveNotification(id)) {
      return this.remove(id);
    }

    const filteredPendingNotifications = this.pendingNotificationQueue.filter(
      this.filterNotification(id),
    );

    this.pendingNotificationQueue = filteredPendingNotifications;
  }

  clear() {
    this.activeNotificationQueue.setValue([]);
    this.pendingNotificationQueue = [];
  }

  private filterNotification = (id: string) => (notification: N) =>
    notification.id !== id;

  private isActiveNotification = (id: string) =>
    this.activeNotificationQueue.value.some(
      (notification) => notification.id === id,
    );
}

function buildNotifier<
  Metadata extends Record<never, never> = Record<never, never>,
  NotificationType extends string = DefaultNotificationType,
  N extends NotificationData<NotificationType> = NotificationData<NotificationType> &
    Metadata,
  A extends N & { status: NotificationStatus } = N & {
    status: NotificationStatus;
  },
  O extends NotifyOptions = Metadata & NotifyOptions,
>(controller: NotificationController<Metadata, NotificationType, N, A>) {
  return controller.config.types.reduce<Record<NotificationType, Notify<O>>>(
    (acc, type) => ({
      ...acc,
      [type]: (message: ReactNode, options?: NotifyOptions) => {
        const notification = {
          message,
          type,
          ...options,
        } as N;

        controller.add(notification);
      },
    }),
    {} as never,
  );
}

export function createNotifier<
  Metadata extends Record<never, never> = Record<never, never>,
  NotificationType extends string = DefaultNotificationType,
  N extends NotificationData<NotificationType> = NotificationData<NotificationType> &
    Metadata,
  A extends N & { status: NotificationStatus } = N & {
    status: NotificationStatus;
  },
  O extends NotifyOptions = Metadata & NotifyOptions,
>(
  config?: NotifierConfig<NotificationType>,
): {
  notifier: Record<NotificationType, Notify<O>>;
  controller: NotificationController<Metadata, NotificationType, N, A>;
} {
  const controller = new Controller<Metadata, NotificationType, N, A>(config);

  const notifier = buildNotifier<Metadata, NotificationType, N, A, O>(
    controller,
  );

  return { notifier, controller };
}

export function useCreateNotifier<
  Metadata extends Record<never, never> = Record<never, never>,
  NotificationType extends string = DefaultNotificationType,
  N extends NotificationData<NotificationType> = NotificationData<NotificationType> &
    Metadata,
  A extends N & { status: NotificationStatus } = N & {
    status: NotificationStatus;
  },
  O extends NotifyOptions = Metadata & NotifyOptions,
>(
  config?: NotifierConfig<NotificationType>,
): {
  notifier: Record<NotificationType, Notify<O>>;
  controller: NotificationController<Metadata, NotificationType, N, A>;
} {
  return useMemo(
    () => createNotifier<Metadata, NotificationType, N, A, O>(config),
    [config],
  );
}

const { notifier, controller } = createNotifier();

notifier.success('success', { delay: 200 });

controller.add({
  type: 'success',
  message: 'success!',
});
