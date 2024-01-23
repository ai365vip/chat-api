import { ColorUtil } from '@visactor/vutils';
export declare function interpolate(a: any, b: any): (() => any) | ((x: number) => number) | ((t: number) => string) | ((x: number) => ColorUtil.RGB) | ((t: number) => Date);
