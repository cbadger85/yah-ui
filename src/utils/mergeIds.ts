import { isTruthy } from './typeGuards';

export function mergeIds(...ids: (string | undefined | null)[]) {
  const existingIds = ids.filter(isTruthy);

  return existingIds.length ? existingIds.join(' ') : undefined;
}
