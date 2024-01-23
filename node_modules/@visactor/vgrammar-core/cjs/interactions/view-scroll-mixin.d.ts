import type { InteractionEvent, IViewScrollMixin, ViewNavigationRange, ViewScrollSimpleOptions, ViewStateByDim } from '../types';
export declare class ViewScrollMixin implements IViewScrollMixin {
    protected _scrollX: number;
    protected _scrollY: number;
    protected formatPanScroll(e: InteractionEvent): InteractionEvent;
    protected formatWheelScroll(e: InteractionEvent): InteractionEvent;
    formatScrollEvent(e: InteractionEvent): InteractionEvent;
    handleScrollStart(e: InteractionEvent, navState: Partial<Record<'x' | 'y', ViewStateByDim>>, scrollOptions?: ViewScrollSimpleOptions): ViewNavigationRange;
    handleScrollEnd(e: InteractionEvent, navState: Partial<Record<'x' | 'y', ViewStateByDim>>, scrollOptions?: ViewScrollSimpleOptions): ViewNavigationRange;
}
