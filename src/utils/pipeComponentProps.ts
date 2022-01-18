export function pipeComponentProps<T>(
  initialProps: T,
  ...fns: ((props: T) => T)[]
): T {
  return fns.reduce((props, getProps) => getProps(props), initialProps);
}
