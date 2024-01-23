import type { interfaces } from '../interfaces/interfaces';
declare class BindingWhenOnSyntax<T> implements interfaces.BindingWhenSyntax<T>, interfaces.BindingOnSyntax<T> {
    private _bindingWhenSyntax;
    private _binding;
    constructor(binding: interfaces.Binding<T>);
    whenTargetNamed(name: string): interfaces.BindingOnSyntax<T>;
}
export { BindingWhenOnSyntax };
