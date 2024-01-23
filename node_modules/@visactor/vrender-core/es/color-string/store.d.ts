export declare function colorEqual(color1: string, color2: string): boolean;
export declare enum ColorType {
    Color255 = 0,
    Color1 = 1
}
export declare class ColorStore {
    private static store255;
    private static store1;
    static Get(str: string, size?: number, arr?: [number, number, number, number]): [number, number, number, number];
    static Set(str: string, size: number, arr: [number, number, number, number]): void;
}
