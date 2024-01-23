import type { SankeyData, SankeyOptions } from './interface';
export declare const transform: (options: SankeyOptions & ({
    width: number;
    height: number;
} | {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}), upstreamData: SankeyData | SankeyData[]) => {
    nodes: import("./interface").SankeyNodeElement[];
    links: import("./interface").SankeyLinkElement[];
    columns: import("./interface").SankeyNodeElement[][];
}[];
