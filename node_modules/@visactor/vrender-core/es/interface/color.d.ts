interface IGradientStop {
    offset: number;
    color: string;
}
export type IGradientColor = ILinearGradient | IRadialGradient | IConicalGradient;
export interface ILinearGradient {
    gradient: 'linear';
    x0?: number;
    y0?: number;
    x1?: number;
    y1?: number;
    stops: IGradientStop[];
}
export interface IRadialGradient {
    gradient: 'radial';
    x0?: number;
    y0?: number;
    x1?: number;
    y1?: number;
    r0?: number;
    r1?: number;
    stops: IGradientStop[];
}
export interface IConicalGradient {
    gradient: 'conical';
    startAngle?: number;
    endAngle?: number;
    x?: number;
    y?: number;
    stops: IGradientStop[];
}
export interface IColorStop {
    offset: number;
    color: string;
}
export type IColor = string | ILinearGradient | IRadialGradient | IConicalGradient;
export {};
