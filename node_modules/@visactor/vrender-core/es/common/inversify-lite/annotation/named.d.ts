declare function named(name: string | number | symbol): <T>(target: import("./decorator_utils").DecoratorTarget<unknown>, targetKey?: string | symbol, indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<T>) => void;
export { named };
