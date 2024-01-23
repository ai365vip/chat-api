import { ColorUtil } from '@visactor/vutils';
export interface IColorRGBObj {
    r: number;
    g: number;
    b: number;
}
export interface IColorRGBAObj extends IColorRGBObj {
    a: number;
}
export declare function colorLinearGenerator(startColor: string, endColor: string, data: Array<any>, field: string): void;
export declare function colorOrdinalGenerator(colorRange: Array<string>, data: Array<any>): void;
export declare function ColorObjGenerator(color: string): IColorObjGenerator;
export interface IColorObjGenerator {
    color: ColorUtil.Color;
    transparent: boolean;
    opacity: number;
}
export declare function rgbaStr2RgbaObj(color: string): IColorRGBAObj;
