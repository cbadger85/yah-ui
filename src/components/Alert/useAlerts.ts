import { useEffect, useRef, useState } from 'react';
import { hasProperty } from '../../utils';
import {
  ActiveAlertData,
  AlertManager,
  AlertManagerConfig,
  createAlertManager,
} from './AlertManager';

export type UseAlerts<M = string, T extends string = string> = Omit<
  AlertManager<M, T>,
  'subscribe' | 'getAlerts'
> & {
  /**
   * the current list of active alerts
   */
  alerts: ActiveAlertData<M, T>[];
};

/**
 * A React wrapper around `AlertManager` that has already subscribed to the alerts.
 *
 * @param manager an instance of `AlertManager` created by `createAlertManager`
 */
export function useAlerts<M = string, T extends string = string>(
  manager: AlertManager<M, T>,
): UseAlerts<M, T>;
/**
 * A React wrapper around `AlertManager` that has already subscribed to the alerts.
 *
 * @param config the configuration object for the `AlertManager`
 */
export function useAlerts<M = string, T extends string = string>(
  config?: AlertManagerConfig,
): UseAlerts<M, T>;
export function useAlerts<M = string, T extends string = string>(
  param?: AlertManagerConfig | AlertManager<M, T>,
): UseAlerts<M, T> {
  const manager = useRef<AlertManager<M, T>>(
    isAlertManager<M, T>(param) ? param : createAlertManager<M, T>(param),
  ).current;

  const [alerts, setAlerts] = useState(manager.getAlerts());

  useEffect(
    function subscribeToActiveAlerts() {
      const unsubscribe = manager.subscribe(setAlerts);

      return unsubscribe;
    },
    [manager, manager.getAlerts],
  );

  return {
    alerts,
    add: manager.add,
    clear: manager.clear,
    remove: manager.remove,
    unmount: manager.unmount,
  };
}

function isAlertManager<M, T extends string>(
  alertManager: unknown,
): alertManager is AlertManager<M, T> {
  return (
    hasProperty(alertManager, 'subscribe') &&
    typeof alertManager.subscribe === 'function' &&
    hasProperty(alertManager, 'add') &&
    typeof alertManager.add === 'function' &&
    hasProperty(alertManager, 'clear') &&
    typeof alertManager.clear === 'function' &&
    hasProperty(alertManager, 'remove') &&
    typeof alertManager.remove === 'function' &&
    hasProperty(alertManager, 'unmount') &&
    typeof alertManager.unmount === 'function' &&
    hasProperty(alertManager, 'getAlerts') &&
    Array.isArray(alertManager.getAlerts)
  );
}
