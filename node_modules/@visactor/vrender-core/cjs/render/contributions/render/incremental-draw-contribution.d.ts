import type { IGroup, IRenderService, IDrawContext, IDrawContribution, IGraphicRender, IDrawItemInterceptorContribution, IContributionProvider } from '../../../interface';
import { DefaultDrawContribution } from './draw-contribution';
import { SyncHook } from '../../../tapable';
declare enum STATUS {
    NORMAL = 0,
    STOP = 1
}
export declare class DefaultIncrementalDrawContribution extends DefaultDrawContribution implements IDrawContribution {
    protected readonly contributions: IGraphicRender[];
    protected readonly lineRender: IGraphicRender;
    protected readonly areaRender: IGraphicRender;
    protected readonly drawItemInterceptorContributions: IContributionProvider<IDrawItemInterceptorContribution>;
    rendering: boolean;
    protected currFrameStartAt: number;
    protected currentIdx: number;
    protected status: STATUS;
    protected checkingForDrawPromise: Promise<any> | null;
    hooks: {
        completeDraw: SyncHook<[], void, import("../../../interface").UnsetAdditionalOptions>;
    };
    protected lastRenderService: IRenderService;
    protected lastDrawContext: IDrawContext;
    protected count: number;
    constructor(contributions: IGraphicRender[], lineRender: IGraphicRender, areaRender: IGraphicRender, drawItemInterceptorContributions: IContributionProvider<IDrawItemInterceptorContribution>);
    draw(renderService: IRenderService, drawContext: IDrawContext): Promise<void>;
    protected _increaseRender(group: IGroup, drawContext: IDrawContext): Promise<void>;
    protected _renderIncrementalGroup(group: IGroup, drawContext: IDrawContext): Promise<void>;
    protected waitToNextFrame(): Promise<boolean>;
    protected checkForDraw(drawContext: IDrawContext): Promise<boolean>;
    protected forceStop(): Promise<void>;
    protected resetToInit(): void;
    renderGroup(group: IGroup, drawContext: IDrawContext): Promise<void>;
}
export {};
