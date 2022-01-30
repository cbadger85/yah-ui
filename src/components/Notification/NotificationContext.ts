import { createContext } from 'react';
import {
  NotificationData,
  ActiveNotificationData,
  AdditionalNotificationProps,
} from './NotificationsManager';

interface NotificationContextValue {
  static: boolean;
  remove: (id: string) => void;
  update: (
    data: Partial<
      ActiveNotificationData<string, AdditionalNotificationProps>
    > & {
      id: string;
    },
  ) => void;
  notification: NotificationData<string, AdditionalNotificationProps>;
  status: 'active' | 'inactive';
}

export const NotificationContext = createContext<
  NotificationContextValue | undefined
>(undefined);
