import type { IGraphic, IGroup, IRichTextCharacter, IStage } from '../interface';
import { type IAABBBounds } from '@visactor/vutils';
export declare function incrementalAddTo(group: IGroup, graphic: IGraphic): void;
export declare function waitForAllSubLayers(stage: IStage): Promise<void>;
export declare function boundStroke(bounds: IAABBBounds, halfW: number, miter: boolean, pad?: number): import("@visactor/vutils").IBounds;
export declare function genNumberType(): number;
export declare enum TextDirection {
    HORIZONTAL = 0,
    VERTICAL = 1
}
export declare function verticalLayout(text: string): {
    text: string;
    direction: TextDirection;
}[];
export declare function xul(str: string | string[]): IRichTextCharacter[];
