import { useRef } from 'react';
import {
  createNotifier,
  NotificationController,
  NotificationMetadata,
  NotifierConfig,
  Notify,
} from './NotificationController';

export function useCreateNotifier<
  T extends string,
  M extends NotificationMetadata = Record<never, never>,
>(
  config?: NotifierConfig<T>,
): {
  notifier: Record<T, Notify<M>>;
  controller: NotificationController<T, M>;
} {
  return useRef(createNotifier<T, M>(config)).current;
}
