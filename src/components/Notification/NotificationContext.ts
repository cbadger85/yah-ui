import { createContext } from 'react';
import {
  NotificationData,
  ActiveNotificationData,
  NotificationMetadata,
} from './NotificationsManager';

interface NotificationContextValue {
  static: boolean;
  remove: (id: string) => void;
  update: (
    data: Partial<ActiveNotificationData<string, NotificationMetadata>> & {
      id: string;
    },
  ) => void;
  notification: NotificationData<string, NotificationMetadata>;
  status: 'active' | 'inactive';
}

export const NotificationContext = createContext<
  NotificationContextValue | undefined
>(undefined);
