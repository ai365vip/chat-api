import type { IRectGraphicAttribute, IPolygonGraphicAttribute, IPathGraphicAttribute } from '@visactor/vrender-core';
import type { SankeyNodeElement, SankeyLinkElement } from './interface';
export declare const formatNodeRect: (nodes: SankeyNodeElement[]) => IRectGraphicAttribute[];
export declare const formatLinkPolygon: (links: SankeyLinkElement[]) => (IPolygonGraphicAttribute & SankeyLinkElement)[];
export declare const formatLinkPath: (links: SankeyLinkElement[], round?: boolean) => (IPathGraphicAttribute & SankeyLinkElement)[];
export declare const getBoundsOfNodes: (nodes: SankeyNodeElement[]) => {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    width: number;
    height: number;
};
export declare const getAlignStartTexts: (nodes: SankeyNodeElement[], offset?: number) => {
    y: number;
    x: number;
    datum: import("./interface").SankeyNodeDatum;
    key: string | number;
}[];
export declare const getAlignEndTexts: (nodes: SankeyNodeElement[], offset?: number) => {
    y: number;
    x: number;
    datum: import("./interface").SankeyNodeDatum;
    key: string | number;
}[];
