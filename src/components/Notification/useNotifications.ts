import { useRef } from 'react';
import { DefaultNotificationType, NotificationManger } from '.';
import {
  createNotificationManager,
  NotificationManagerConfig,
  NotificationMetadata,
} from './NotificationsManager';

export function useNotifications<
  T extends DefaultNotificationType = DefaultNotificationType,
  M extends NotificationMetadata = Record<never, never>,
>(config?: NotificationManagerConfig<T>): NotificationManger<T, M>;
export function useNotifications<
  T extends string,
  M extends NotificationMetadata = Record<never, never>,
>(config: NotificationManagerConfig<T>): NotificationManger<T, M>;
export function useNotifications<
  T extends string,
  M extends NotificationMetadata = Record<never, never>,
>(config?: NotificationManagerConfig<T>): NotificationManger<T, M> {
  return useRef(
    createNotificationManager<T, M>(config as NotificationManagerConfig<T>),
  ).current;
}
