import type { IRunningConfig, ITheme, SignalSpec } from '../types';
import type { IViewOptions, IViewThemeConfig, ViewSpec } from '../types/view';
export declare const BuiltInSignalID: string[];
export declare const builtInSignals: (option: IViewOptions, config: IViewThemeConfig, theme: ITheme) => SignalSpec<any>[];
export declare const normalizePadding: (value: number | {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
}) => {
    top: number;
    left: number;
    right: number;
    bottom: number;
};
export declare const normalizeMarkTree: (spec: ViewSpec) => ViewSpec;
export declare const normalizeRunningConfig: (runningConfig: IRunningConfig) => IRunningConfig;
