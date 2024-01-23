import type { Dict } from '../type';
export type KeyOfDistributive<T> = T extends unknown ? keyof T : never;
export declare function keys<T extends any>(obj: T): (KeyOfDistributive<T> & string)[];
export declare function defaults<T extends Dict<any>, S extends Dict<any>>(target: T, source: S, overlay?: boolean): T & S;
export declare function mixin<T, S>(target: T | Function, source: S | Function, override?: boolean): void;
