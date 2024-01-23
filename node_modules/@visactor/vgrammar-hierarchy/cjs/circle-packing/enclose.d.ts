import type { ICircle } from '../interface';
export default function (circles: ICircle[]): ICircle;
export declare function packEncloseRandom(circles: ICircle[], random: () => number): ICircle;
