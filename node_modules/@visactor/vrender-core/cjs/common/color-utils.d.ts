import type { IColor } from '../interface';
export declare class GradientParser {
    static IsGradient(c: IColor): boolean;
    static IsGradientStr(c: IColor): boolean;
    static Parse(c: IColor): IColor;
    private static ParseConic;
    private static ParseRadial;
    private static ParseLinear;
}
