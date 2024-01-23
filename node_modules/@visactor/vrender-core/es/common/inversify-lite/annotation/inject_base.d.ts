import type { DecoratorTarget } from './decorator_utils';
import type { ServiceIdentifierOrFunc } from './lazy_service_identifier';
export declare function injectBase(metadataKey: string): <T = unknown>(serviceIdentifier: ServiceIdentifierOrFunc<T>) => (target: DecoratorTarget, targetKey?: string | symbol, indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<T>) => void;
