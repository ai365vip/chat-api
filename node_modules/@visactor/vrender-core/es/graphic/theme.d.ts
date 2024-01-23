import type { IFullThemeSpec, IGraphic, IGroup, ITheme, IThemeSpec } from '../interface';
export declare function newThemeObj(): IFullThemeSpec;
export declare class Theme implements ITheme {
    combinedTheme: IFullThemeSpec;
    userTheme?: IThemeSpec;
    protected _defaultTheme: IFullThemeSpec;
    dirty: boolean;
    constructor();
    initTheme(): void;
    getTheme(group?: IGroup): IFullThemeSpec;
    getParentWithTheme(group: IGroup): IGroup;
    applyTheme(group: IGroup, pt: IThemeSpec, force?: boolean): IThemeSpec;
    protected doCombine(parentCombinedTheme?: IThemeSpec): void;
    setTheme(t: IThemeSpec, g: IGroup): void;
    resetTheme(t: IThemeSpec, g: IGroup): void;
    dirtyChildren(g: IGroup): void;
}
export declare const globalTheme: Theme;
export declare function getTheme(graphic: IGraphic, theme?: IFullThemeSpec): IFullThemeSpec;
export declare function getThemeFromGroup(graphic: IGraphic): IFullThemeSpec | null;
