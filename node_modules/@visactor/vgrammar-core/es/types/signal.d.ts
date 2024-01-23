import type { GrammarSpec, IScale, ISignal } from './grammar';
export type FunctionCallback<T> = (...args: any[]) => T;
export type SignalDependency = string | ISignal<any> | IScale;
export interface SignalFunction<Callback extends FunctionCallback<T>, T> {
    callback: Callback;
    dependency?: SignalDependency | SignalDependency[];
}
export interface SignalReference<T = any> {
    signal: string | ISignal<T>;
}
export type GenericFunctionType<Callback extends FunctionCallback<T>, T> = T | Callback | SignalReference<T> | SignalFunction<Callback, T>;
export type SimpleSignalType<T> = T | SignalReference<T>;
export type ParameterCallback<T> = (parameters: any) => T;
export type ParameterFunctionType<T> = GenericFunctionType<ParameterCallback<T>, T>;
export type SignalFunctionCallback<T> = (signal: T, parameters: any) => T;
export type SignalFunctionType<T> = GenericFunctionType<SignalFunctionCallback<T>, T>;
export interface SignalSpec<T> extends GrammarSpec {
    name?: string;
    value?: T;
    update?: SignalFunctionType<T>;
}
