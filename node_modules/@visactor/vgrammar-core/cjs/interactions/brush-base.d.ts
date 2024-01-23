import { Brush } from '@visactor/vrender-components';
import type { BrushOptions, IElement, IGlyphElement, IMark, IView, InteractionEventHandler } from '../types';
import { BaseInteraction } from './base';
import type { IGraphic, IPolygon } from '@visactor/vrender-core';
import { type IBounds } from '@visactor/vutils';
export declare abstract class BrushBase<T extends BrushOptions> extends BaseInteraction<T> {
    options: T;
    protected _brushComp?: Brush;
    protected _marks?: IMark[];
    constructor(view: IView, options?: T);
    protected getEvents(): Array<{
        type: string;
        handler: InteractionEventHandler;
    }>;
    protected isPolygonBrushContainGraphicItem(brushMask: IPolygon, graphicItem: IGraphic, offset?: {
        x: number;
        y: number;
    }): boolean;
    protected isRectBrushContainGraphicItem(brushMask: IPolygon, graphicItem: IGraphic, offset?: {
        x: number;
        y: number;
    }): boolean;
    protected isBrushContainGraphicItem(brushMask: IPolygon, graphicItem: IGraphic, offset?: {
        x: number;
        y: number;
    }): boolean;
    handleAfterDraw: () => void;
    abstract handleBrushUpdate: (event: {
        type: string;
        detail: {
            operateMask: IPolygon;
            operatedMaskAABBBounds: {
                [name: string]: IBounds;
            };
        };
    }) => void;
    unbind(): void;
    protected _dispatchEvent(event: {
        type: string;
        detail: {
            operateMask: IPolygon;
            operatedMaskAABBBounds: {
                [name: string]: IBounds;
            };
        };
    }, activeElements: (IElement | IGlyphElement)[]): void;
}
