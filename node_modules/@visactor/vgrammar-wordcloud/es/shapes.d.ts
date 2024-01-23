export declare const shapes: {
    triangleForward: typeof triangleForward;
    triangleUpright: typeof triangle;
    triangle: typeof triangle;
    diamond: typeof diamond;
    square: typeof square;
    star: typeof star;
    cardioid: typeof cardioid;
    circle: typeof circle;
    pentagon: typeof pentagon;
};
declare function diamond(): (theta: number) => number;
declare function star(): (theta: number) => number;
declare function square(): (theta: number) => number;
declare function triangle(): (theta: number) => number;
declare function triangleForward(): (theta: number) => number;
declare function cardioid(): (theta: number) => number;
declare function circle(): () => number;
declare function pentagon(): (theta: number) => number;
export declare function getMaxRadiusAndCenter(shape: string, size: [number, number]): {
    maxRadius: number;
    center: number[];
};
export declare const getShapeFunction: (type: string) => any;
export {};
