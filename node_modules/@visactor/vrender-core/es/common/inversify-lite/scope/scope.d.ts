import type { interfaces } from '../interfaces/interfaces';
export declare const tryGetFromScope: <T>(requestScope: interfaces.RequestScope, binding: interfaces.Binding<T>) => T | Promise<T>;
export declare const saveToScope: <T>(requestScope: interfaces.RequestScope, binding: interfaces.Binding<T>, result: T | Promise<T>) => void;
