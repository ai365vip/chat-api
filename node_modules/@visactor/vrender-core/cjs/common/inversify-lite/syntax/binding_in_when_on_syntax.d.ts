import type { interfaces } from '../interfaces/interfaces';
declare class BindingInWhenOnSyntax<T> implements interfaces.BindingInSyntax<T>, interfaces.BindingWhenSyntax<T>, interfaces.BindingOnSyntax<T> {
    private _bindingInSyntax;
    private _bindingWhenSyntax;
    private _binding;
    constructor(binding: interfaces.Binding<T>);
    inRequestScope(): interfaces.BindingWhenOnSyntax<T>;
    inSingletonScope(): interfaces.BindingWhenOnSyntax<T>;
    inTransientScope(): interfaces.BindingWhenOnSyntax<T>;
    whenTargetNamed(name: string): interfaces.BindingOnSyntax<T>;
}
export { BindingInWhenOnSyntax };
