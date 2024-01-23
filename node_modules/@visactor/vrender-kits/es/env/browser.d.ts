import { ContainerModule, type Container } from '@visactor/vrender-core';
export declare const browserEnvModule: ContainerModule;
export declare function loadBrowserEnv(container: Container, loadPicker?: boolean): void;
export declare namespace loadBrowserEnv {
    var __loaded: boolean;
}
export declare function initBrowserEnv(): void;
