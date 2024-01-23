import type { ITheme } from '../types';
export declare class ThemeManager {
    private static _themes;
    static registerTheme(name: string, theme: Partial<ITheme>): void;
    static unregisterTheme(name: string): void;
    static getTheme(name: string): ITheme;
    static getDefaultTheme(): ITheme;
}
