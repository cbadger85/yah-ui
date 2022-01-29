import { createContext } from 'react';
import { ActiveNotificationData } from '.';
import { NotificationData } from './useCreateNotifier';

interface NotificationContextValue {
  static: boolean;
  remove: (id: string) => void;
  update: (
    data: Partial<ActiveNotificationData<string>> & { id: string },
  ) => void;
  notification: NotificationData<string>;
  status: 'active' | 'inactive';
}

export const NotificationContext = createContext<
  NotificationContextValue | undefined
>(undefined);
