export declare function ordinaryLeastSquares(uX: number, uY: number, uXY: number, uX2: number): number[];
export declare function visitPoints(data: any[], x: (datum: any) => number, y: (datum: any) => number, callback: (x: number, y: number, index: number) => void): void;
export declare function rSquared(data: any[], x: (datum: any) => number, y: (datum: any) => number, uY: number, predict: (x: number) => number): number;
export declare function regressionLinear(data: any[], x?: (datum: any) => number, y?: (datum: any) => number): {
    coef: number[];
    predict: (x: number) => number;
    rSquared: number;
};
