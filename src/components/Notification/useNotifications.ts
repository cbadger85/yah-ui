import { useRef } from 'react';
import {
  createNotificationManager,
  NotificationManagerConfig,
  AdditionalNotificationProps,
  DefaultNotificationType,
  NotificationManager,
} from './NotificationsManager';

export function useNotifications<
  T extends string = DefaultNotificationType,
  M extends AdditionalNotificationProps = Record<never, never>,
>(config?: NotificationManagerConfig): NotificationManager<T, M> {
  return useRef(
    createNotificationManager<T, M>(config as NotificationManagerConfig),
  ).current;
}
