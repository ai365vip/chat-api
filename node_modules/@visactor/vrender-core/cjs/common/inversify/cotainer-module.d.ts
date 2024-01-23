import type { interfaces } from '../inversify-lite';
export declare class ContainerModule {
    id: number;
    registry: interfaces.ContainerModuleCallBack;
    constructor(registry: interfaces.ContainerModuleCallBack);
}
