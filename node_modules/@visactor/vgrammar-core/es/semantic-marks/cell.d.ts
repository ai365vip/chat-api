import { GrammarMarkType } from '../graph/enums';
import type { StateEncodeSpec, MarkSpec, MarkFunctionType, AttributeTransform, BaseSingleEncodeSpec } from '../types';
import { Mark } from '../view/mark';
export declare class Cell extends Mark {
    static markType: GrammarMarkType;
    markType: GrammarMarkType.cell;
    protected spec: MarkSpec;
    protected _encoders: StateEncodeSpec | null;
    encodeState(state: string, channel: string | BaseSingleEncodeSpec, value?: MarkFunctionType<any>): this;
    protected _updateComponentEncoders(state: string): void;
    protected _getEncoders(): StateEncodeSpec<Partial<Omit<import("@visactor/vrender-core").IGraphicAttribute, "strokeSeg" | "boundsPadding" | "pickMode" | "boundsMode" | "customPickShape" | "pickable" | "childrenPickable" | "visible" | "zIndex" | "layout" | "keepDirIn3d" | "postMatrix" | "anchor" | "anchor3d">>>;
    getAttributeTransforms(): AttributeTransform[];
    release(): void;
}
export declare const registerCellMark: () => void;
