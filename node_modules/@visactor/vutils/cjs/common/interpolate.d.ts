export declare function interpolateNumber(a: number, b: number): (x: number) => number;
export declare function interpolateNumberRound(a: number, b: number): (x: number) => number;
export declare function interpolateDate(a: Date, b: Date): (t: number) => Date;
export declare function interpolateString(a: any, b: any): (() => any) | ((t: any) => string);
