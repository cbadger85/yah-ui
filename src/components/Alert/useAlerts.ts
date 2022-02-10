import { useEffect, useRef, useState } from 'react';
import { hasProperty } from '../../utils';
import {
  ActiveAlertData,
  AlertManager,
  AlertManagerConfig,
  createAlertManager,
} from './AlertManager';

export type UseAlerts<M = string> = Omit<
  AlertManager<M>,
  'subscribe' | 'getAlerts' | 'configure'
> & {
  /**
   * the current list of active alerts
   */
  alerts: ActiveAlertData<M>[];
};

/**
 * A React wrapper around `AlertManager` that has already subscribed to the alerts.
 *
 * @param manager an instance of `AlertManager` created by `createAlertManager`
 */
export function useAlerts<M = string>(manager: AlertManager<M>): UseAlerts<M>;
/**
 * A React wrapper around `AlertManager` that has already subscribed to the alerts.
 *
 * @param config the configuration object for the `AlertManager`
 */
export function useAlerts<M = string>(
  config?: AlertManagerConfig,
): UseAlerts<M>;
export function useAlerts<M = string>(
  param?: AlertManagerConfig | AlertManager<M>,
): UseAlerts<M> {
  const manager = useRef<AlertManager<M>>(
    isAlertManager<M>(param) ? param : createAlertManager<M>(param),
  ).current;

  const [alerts, setAlerts] = useState(manager.getAlerts());

  useEffect(
    function subscribeToActiveAlerts() {
      const unsubscribe = manager.subscribe(setAlerts);

      return unsubscribe;
    },
    [manager],
  );

  useEffect(
    function updateConfig() {
      if (!isAlertManager<M>(param)) {
        manager.configure(param);
      }
    },
    [param, manager],
  );

  return {
    alerts,
    add: manager.add,
    clear: manager.clear,
    remove: manager.remove,
    unmount: manager.unmount,
  };
}

export function isAlertManager<M>(
  alertManager: unknown,
): alertManager is AlertManager<M> {
  return (
    typeof alertManager === 'object' &&
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
    typeof alertManager.getAlerts === 'function'
  );
}
