import type { interfaces } from '../interfaces';
declare class BindingInSyntax<T> implements interfaces.BindingInSyntax<T> {
    private _binding;
    constructor(binding: interfaces.Binding<T>);
    inRequestScope(): interfaces.BindingInSyntax<T>;
    inSingletonScope(): interfaces.BindingInSyntax<T>;
    inTransientScope(): interfaces.BindingInSyntax<T>;
    whenTargetNamed(name: string | number | symbol): interfaces.BindingOnSyntax<T>;
}
export { BindingInSyntax };
