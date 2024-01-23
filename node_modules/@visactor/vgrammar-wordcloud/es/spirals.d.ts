export declare const spirals: {
    archimedean: typeof archimedeanSpiral;
    rectangular: typeof rectangularSpiral;
};
declare function archimedeanSpiral(size: [number, number]): (t: number) => [number, number];
declare function rectangularSpiral(size: number): (t: number) => [number, number];
export {};
