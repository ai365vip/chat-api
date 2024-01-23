import type { interfaces } from './interfaces';
declare class Binding<TActivated> implements interfaces.Binding<TActivated> {
    id: number;
    moduleId: interfaces.ContainerModuleBase['id'];
    activated: boolean;
    serviceIdentifier: interfaces.ServiceIdentifier<TActivated>;
    implementationType: interfaces.Newable<TActivated> | TActivated | null;
    cache: TActivated | null;
    dynamicValue: interfaces.DynamicValue<TActivated> | null;
    scope: interfaces.BindingScope;
    type: interfaces.BindingType;
    factory: interfaces.FactoryCreator<unknown> | null;
    provider: interfaces.ProviderCreator<unknown> | null;
    constraint: interfaces.ConstraintFunction;
    constructor(serviceIdentifier: interfaces.ServiceIdentifier<TActivated>, scope: interfaces.BindingScope);
    clone(): interfaces.Binding<TActivated>;
}
export { Binding };
