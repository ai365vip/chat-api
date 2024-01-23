import type { AsArray, FullTap, IfSet, Tap, UnsetAdditionalOptions } from '../interface';
export declare abstract class Hook<T, R, AdditionalOptions = UnsetAdditionalOptions> {
    private _args;
    readonly name?: string;
    taps: FullTap[];
    constructor(args: string[], name?: string);
    tap(options: string | (Tap & IfSet<AdditionalOptions>), fn: (...args: AsArray<T>) => R): void;
    unTap(options: string | (Tap & IfSet<AdditionalOptions>), fn?: (...args: AsArray<T>) => R): void;
    private _parseOptions;
    private _tap;
    private _insert;
}
