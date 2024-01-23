import type { ICanvas, IContext2d, EnvType, IGlobal, ITextAttribute, IContributionProvider, IGraphic, IGraphicAttribute, IStage } from '../interface';
import type { ITextMeasure, TextOptionsType } from '../interface/text';
import type { IMatrix, IPointLike, ITextMeasureOption } from '@visactor/vutils';
import { TextMeasure } from '@visactor/vutils';
import type { IGraphicUtil, ITransformUtil, TransformType } from '../interface/core';
export declare class DefaultGraphicUtil implements IGraphicUtil {
    protected readonly contributions: IContributionProvider<ITextMeasure>;
    get canvas(): ICanvas;
    get context(): IContext2d | null;
    _canvas?: ICanvas;
    _context?: IContext2d | null;
    _textMeasure: ITextMeasure;
    configured: boolean;
    global: IGlobal;
    constructor(contributions: IContributionProvider<ITextMeasure>);
    get textMeasure(): ITextMeasure;
    configure(global: IGlobal, env: EnvType): void;
    tryInitCanvas(): void;
    bindTextMeasure(tm: ITextMeasure): void;
    measureText(text: string, tc: TextOptionsType, method?: 'native' | 'simple' | 'quick'): {
        width: number;
        height: number;
    };
    createTextMeasureInstance(textSpec?: Partial<ITextAttribute>, option?: Partial<ITextMeasureOption>, getCanvasForMeasure?: () => any): TextMeasure<ITextAttribute>;
    drawGraphicToCanvas(graphic: IGraphic<Partial<IGraphicAttribute>>, stage: IStage, canvas?: HTMLCanvasElement): HTMLCanvasElement | null | Promise<HTMLCanvasElement>;
}
export declare class DefaultTransformUtil implements ITransformUtil {
    private matrix;
    private originTransform;
    private outSourceMatrix;
    private outTargetMatrix;
    private mode;
    constructor();
    init(origin: TransformType): this;
    fromMatrix(source: IMatrix, target: IMatrix): this;
    private scaleMatrix;
    private rotateMatrix;
    scale(sx: number, sy: number, center?: IPointLike): this;
    rotate(angle: number, center?: IPointLike): this;
    private translateMatrix;
    translate(dx: number, dy: number): this;
    simplify(target: TransformType): this;
    private simplifyMatrix;
}
