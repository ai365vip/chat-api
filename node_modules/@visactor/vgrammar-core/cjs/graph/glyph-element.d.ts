import type { IGlyphElement, IGlyphMark } from '../types';
import { Element } from './element';
import type { IGraphicAttribute, IGlyph } from '@visactor/vrender-core';
export declare class GlyphElement extends Element implements IGlyphElement {
    graphicItem: IGlyph;
    mark: IGlyphMark;
    protected glyphGraphicItems: {
        [markName: string]: any;
    };
    private glyphMeta;
    constructor(mark: IGlyphMark);
    getGlyphGraphicItems(): {
        [markName: string]: any;
    };
    initGraphicItem(attributes?: any): void;
    useStates(states: string[], hasAnimation?: boolean): boolean;
    protected getStateAttrs: (stateName: string, nextStates: string[]) => {
        attributes: Partial<IGraphicAttribute>;
        subAttributes: Partial<IGraphicAttribute>[];
    };
    encodeGraphic(): void;
    encodeCustom(nextAttrs?: any): {
        [markName: string]: any;
    };
    private encodeDefault;
    private _onGlyphAttributeUpdate;
    private _generateGlyphItems;
    getGraphicAttribute(channel: string, prev?: boolean, markName?: any): any;
    setGraphicAttribute(channel: string, value: any, final?: boolean, markName?: any): void;
    setGraphicAttributes(attributes: {
        [channel: string]: any;
    }, final?: boolean, markName?: any): void;
    protected diffAttributes(graphicAttributes: {
        [channel: string]: any;
    }, markName?: string): {};
    protected applyGlyphGraphicAttributes(graphicAttributes: any, markName: string, graphicItem: any): void;
    getFinalGraphicAttributes(markName?: string): any;
    protected setFinalGraphicAttributes(attributes: {
        [channel: string]: any;
    }, markName?: string): void;
    getPrevGraphicAttributes(markName?: string): any;
    protected setPrevGraphicAttributes(attributes: {
        [channel: string]: any;
    }, markName?: string): void;
    getNextGraphicAttributes(markName?: string): any;
    protected setNextGraphicAttributes(attributes: {
        [channel: string]: any;
    }, markName?: string): void;
    clearChangedGraphicAttributes(): void;
    clearGraphicAttributes(): void;
    remove(): void;
    release(): void;
}
