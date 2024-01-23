declare const inject: <T = unknown>(serviceIdentifier: import("./lazy_service_identifier").ServiceIdentifierOrFunc<T>) => (target: import("./decorator_utils").DecoratorTarget<unknown>, targetKey?: string | symbol, indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<T>) => void;
export { inject };
