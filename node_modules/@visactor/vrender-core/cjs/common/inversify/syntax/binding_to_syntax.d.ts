import type { interfaces } from '../interfaces';
declare class BindingToSyntax<T> implements interfaces.BindingToSyntax<T> {
    private _binding;
    constructor(binding: interfaces.Binding<T>);
    to(constructor: interfaces.Newable<T>): interfaces.BindingInWhenOnSyntax<T>;
    toSelf(): interfaces.BindingInWhenOnSyntax<T>;
    toDynamicValue(func: interfaces.DynamicValue<T>): interfaces.BindingInWhenOnSyntax<T>;
    toConstantValue(value: T): interfaces.BindingInSyntax<T>;
    toFactory<T2>(factory: interfaces.FactoryCreator<T2>): interfaces.BindingInWhenOnSyntax<T>;
    toService(service: string | symbol | interfaces.Newable<T> | interfaces.Abstract<T>): void;
}
export { BindingToSyntax };
