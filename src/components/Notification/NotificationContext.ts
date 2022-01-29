import { createContext } from 'react';
import { ActiveNotificationData } from '.';
import { NotificationData } from './useCreateNotifier';

interface NotificationContextValue {
  static: boolean;
  remove: (id: string) => void;
  update: (
    data: Partial<ActiveNotificationData<string, Record<never, never>>> & {
      id: string;
    },
  ) => void;
  notification: NotificationData<string, Record<never, never>>;
  status: 'active' | 'inactive';
}

export const NotificationContext = createContext<
  NotificationContextValue | undefined
>(undefined);
