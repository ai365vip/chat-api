import type { SignalFunctionType, SignalSpec } from '../types/signal';
import type { GrammarType, IGrammarBase, ISignal } from '../types/grammar';
import { GrammarBase } from './grammar-base';
import type { Nil } from '../types/base';
export declare class Signal<T> extends GrammarBase implements ISignal<T> {
    readonly grammarType: GrammarType;
    protected spec: SignalSpec<T>;
    private _signal;
    parse(spec: SignalSpec<T>): this;
    evaluate(upstream: any, parameters: any): this;
    output(): T;
    getValue(): T;
    set(value: T): boolean;
    update(update: SignalFunctionType<T> | Nil): this;
    value(value: T | Nil): this;
    reuse(grammar: IGrammarBase): this;
    clear(): void;
}
