import { ContainerModule, type Container } from '@visactor/vrender-core';
export declare const nodeEnvModule: ContainerModule;
export declare function loadNodeEnv(container: Container, loadPicker?: boolean): void;
export declare namespace loadNodeEnv {
    var __loaded: boolean;
}
export declare function initNodeEnv(): void;
