import type { AsArray } from './common';
export type Tap = TapOptions & {
    name: string;
};
export type TapOptions = {
    before?: string;
    stage?: number;
};
export type IfSet<X> = X extends UnsetAdditionalOptions ? any : X;
export interface UnsetAdditionalOptions {
    _UnsetAdditionalOptions: true;
}
export interface IHook<T, R, AdditionalOptions = UnsetAdditionalOptions> {
    name?: string;
    taps: FullTap[];
    tap: (options: string | (Tap & IfSet<AdditionalOptions>), fn: (...args: AsArray<T>) => R) => void;
    unTap: (options: string | (Tap & IfSet<AdditionalOptions>), fn?: (...args: AsArray<T>) => R) => void;
}
export interface ISyncHook<T, R = void, AdditionalOptions = UnsetAdditionalOptions> extends IHook<T, R, AdditionalOptions> {
    call: (...args: AsArray<T>) => R;
}
export type FullTap = Tap & {
    type: 'sync' | 'async' | 'promise';
    fn: (...d: any) => any;
};
export type ICompileOptions = any;
