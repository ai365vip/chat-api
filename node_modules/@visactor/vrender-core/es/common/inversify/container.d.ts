import type { interfaces } from './interfaces';
export declare class Container {
    id: number;
    readonly options: interfaces.ContainerOptions;
    private _bindingDictionary;
    private _metadataReader;
    constructor(containerOptions?: interfaces.ContainerOptions);
    load(module: interfaces.ContainerModule): void;
    get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T;
    getAll<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[];
    getTagged<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, key: string | number | symbol, value: unknown): T;
    getNamed<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, named: string | number | symbol): T;
    isBound(serviceIdentifier: interfaces.ServiceIdentifier<unknown>): boolean;
    bind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T>;
    unbind(serviceIdentifier: interfaces.ServiceIdentifier): void;
    rebind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T>;
    private _getContainerModuleHelpersFactory;
    private _getNotAllArgs;
    private _getAllArgs;
    private _get;
    private _getChildRequest;
    private _resolveFromBinding;
    private _getResolvedFromBinding;
    private _resolveInstance;
    private _createInstance;
    private _resolveRequests;
    private _saveToScope;
}
