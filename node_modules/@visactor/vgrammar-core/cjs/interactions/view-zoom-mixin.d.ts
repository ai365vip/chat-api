import type { IViewZoomMixin, InteractionEvent, ViewNavigationRange, ViewStateByDim, ViewZoomSimpleOptions } from '../types';
export declare class ViewZoomMixin implements IViewZoomMixin {
    protected _state: Partial<Record<'x' | 'y', ViewStateByDim>>;
    protected _lastScale: number;
    protected _zoomPos: {
        zoomDelta: number;
        zoomX: number;
        zoomY: number;
    };
    protected _formatPinchZoom(e: InteractionEvent): InteractionEvent;
    protected _formatWheelZoom(e: InteractionEvent): InteractionEvent;
    formatZoomEvent(e: InteractionEvent): InteractionEvent;
    updateZoomRange(rangeFactor: [number, number], range: [number, number], zoomEvent: {
        zoomDelta: number;
        zoomX: number;
        zoomY: number;
    }, zoomOptions?: {
        rate?: number;
        focus?: boolean;
    }): [number, number];
    protected _handleZooming(zoomPos: {
        zoomDelta: number;
        zoomX: number;
        zoomY: number;
    }, navState: Partial<Record<'x' | 'y', ViewStateByDim>>, zoomOptions?: ViewZoomSimpleOptions): ViewNavigationRange;
    handleZoomStart(e: InteractionEvent, navState: Partial<Record<'x' | 'y', ViewStateByDim>>, zoomOptions?: ViewZoomSimpleOptions): ViewNavigationRange;
    handleZoomEnd(e: InteractionEvent, navState: Partial<Record<'x' | 'y', ViewStateByDim>>, zoomOptions?: ViewZoomSimpleOptions): ViewNavigationRange;
    handleZoomReset(e: InteractionEvent, navState: Partial<Record<'x' | 'y', ViewStateByDim>>, zoomOptions?: ViewZoomSimpleOptions): ViewNavigationRange;
}
