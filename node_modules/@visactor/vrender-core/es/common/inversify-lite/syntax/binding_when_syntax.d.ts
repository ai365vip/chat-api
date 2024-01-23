import type { interfaces } from '../interfaces/interfaces';
declare class BindingWhenSyntax<T> implements interfaces.BindingWhenSyntax<T> {
    private _binding;
    constructor(binding: interfaces.Binding<T>);
    whenTargetNamed(name: string | number | symbol): interfaces.BindingOnSyntax<T>;
}
export { BindingWhenSyntax };
