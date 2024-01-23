import { ContainerModule, type Container } from '@visactor/vrender-core';
export declare const wxEnvModule: ContainerModule;
export declare function loadWxEnv(container: Container, loadPicker?: boolean): void;
export declare namespace loadWxEnv {
    var __loaded: boolean;
}
export declare function initWxEnv(): void;
