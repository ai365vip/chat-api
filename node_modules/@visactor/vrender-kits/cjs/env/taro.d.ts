import { ContainerModule, type Container } from '@visactor/vrender-core';
export declare const taroEnvModule: ContainerModule;
export declare function loadTaroEnv(container: Container, loadPicker?: boolean): void;
export declare namespace loadTaroEnv {
    var __loaded: boolean;
}
export declare function initTaroEnv(): void;
