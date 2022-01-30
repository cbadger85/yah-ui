import { useRef } from 'react';
import { DefaultNotificationType, NotificationManger } from '.';
import {
  createNotificationManager,
  NotificationManagerConfig,
  AdditionalNotificationProps,
} from './NotificationsManager';

export function useNotifications<
  M extends AdditionalNotificationProps = Record<never, never>,
>(
  config?: NotificationManagerConfig<DefaultNotificationType>,
): NotificationManger<DefaultNotificationType, M>;
export function useNotifications<
  T extends string,
  M extends AdditionalNotificationProps = Record<never, never>,
>(config: NotificationManagerConfig<T>): NotificationManger<T, M>;
export function useNotifications<
  T extends string,
  M extends AdditionalNotificationProps = Record<never, never>,
>(config?: NotificationManagerConfig<T>): NotificationManger<T, M> {
  return useRef(
    createNotificationManager<T, M>(config as NotificationManagerConfig<T>),
  ).current;
}
