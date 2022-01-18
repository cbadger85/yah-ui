import { useRef } from 'react';

function generateIds(): Record<string, number> {
  return { uid: 1 };
}

let source = generateIds();

export function generateUniqueId(prefix = 'uid') {
  const nextVal = (source[prefix] || 0) + 1;
  source[prefix] = nextVal;

  return `${prefix}-${nextVal}`;
}

export function useGenerateUniqueId(prefix = 'uid') {
  return useRef(generateUniqueId(prefix)).current;
}

export function useGenerateUniqueIdOrDefault(
  defaultId?: string,
  options?: { generatedIdPrefix?: string },
) {
  const generatedId = useGenerateUniqueId(options?.generatedIdPrefix);

  return defaultId ?? generatedId;
}

// For SSR support, this should be called before any renderToString/renderToStream call is made
export function resetIds() {
  source = generateIds();
}
