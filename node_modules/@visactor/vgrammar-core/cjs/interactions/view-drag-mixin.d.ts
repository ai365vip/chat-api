import type { InteractionEvent, IViewDragMixin, ViewNavigationRange, ViewDragSimpleOptions, ViewStateByDim } from '../types';
export declare class ViewDragMixin implements IViewDragMixin {
    protected _pointerId: number;
    protected _dragStart: {
        x: number;
        y: number;
    };
    protected _filterValueX: {
        start: number;
        end: number;
    };
    protected _filterValueY: {
        start: number;
        end: number;
    };
    protected _shouldTriggerDragByPointer(e: InteractionEvent): boolean;
    protected _shouldStart(e: InteractionEvent): boolean;
    protected _shouldUpdate(e: InteractionEvent): boolean;
    handleDragStart(e: InteractionEvent, navState: Partial<Record<'x' | 'y', ViewStateByDim>>, dragOptions?: ViewDragSimpleOptions): ViewNavigationRange;
    handleDragUpdate(e: InteractionEvent, navState: Partial<Record<'x' | 'y', ViewStateByDim>>, dragOptions?: ViewDragSimpleOptions): ViewNavigationRange;
    handleDragEnd(e: InteractionEvent, navState: Partial<Record<'x' | 'y', ViewStateByDim>>, dragOptions?: ViewDragSimpleOptions): ViewNavigationRange;
}
