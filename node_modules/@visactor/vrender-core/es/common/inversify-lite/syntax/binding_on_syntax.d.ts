import type { interfaces } from '../interfaces/interfaces';
declare class BindingOnSyntax<T> implements interfaces.BindingOnSyntax<T> {
    private _binding;
    constructor(binding: interfaces.Binding<T>);
}
export { BindingOnSyntax };
