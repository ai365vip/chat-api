import { Metadata } from '../meta-data';
export declare function createTaggedDecorator(metadata: Metadata): <T>(target: DecoratorTarget, targetKey?: string | symbol, indexOrPropertyDescriptor?: number) => void;
type Prototype<T> = {
    [Property in keyof T]: T[Property] extends NewableFunction ? T[Property] : T[Property] | undefined;
} & {
    constructor: NewableFunction;
};
interface ConstructorFunction<T = Record<string, unknown>> {
    new (...args: unknown[]): T;
    prototype: Prototype<T>;
}
export type DecoratorTarget<T = unknown> = ConstructorFunction<T> | Prototype<T>;
export declare function injectBase(metadataKey: string): <T = unknown>(serviceIdentifier: any) => (target: DecoratorTarget<T>, targetKey?: string | symbol, indexOrPropertyDescriptor?: number) => void;
export {};
