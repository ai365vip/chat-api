import { isNil } from "@visactor/vutils";

import { handleScrolling } from "./view-utils";

export class ViewDragMixin {
    _shouldTriggerDragByPointer(e) {
        if (!isNil(e.pointerId)) {
            const shouldStart = isNil(this._pointerId) || this._pointerId === e.pointerId;
            return this._pointerId = e.pointerId, shouldStart;
        }
        return !0;
    }
    _shouldStart(e) {
        return this._shouldTriggerDragByPointer(e);
    }
    _shouldUpdate(e) {
        return this._shouldTriggerDragByPointer(e);
    }
    handleDragStart(e, navState, dragOptions) {
        if (this._shouldStart(e)) return this._dragStart = {
            x: e.canvasX,
            y: e.canvasY
        }, null;
    }
    handleDragUpdate(e, navState, dragOptions) {
        if (this._dragStart && this._shouldUpdate(e)) {
            if (null == dragOptions ? void 0 : dragOptions.realtime) {
                const x = e.canvasX - this._dragStart.x, y = e.canvasY - this._dragStart.y;
                return handleScrolling({
                    x: x,
                    y: y
                }, navState, dragOptions);
            }
            return null;
        }
    }
    handleDragEnd(e, navState, dragOptions) {
        if (!this._dragStart) return;
        const res = !1 === (null == dragOptions ? void 0 : dragOptions.realtime) ? handleScrolling({
            x: e.canvasX - this._dragStart.x,
            y: e.canvasY - this._dragStart.y
        }, navState, dragOptions) : null;
        return this._pointerId = null, this._dragStart = null, res;
    }
}
//# sourceMappingURL=view-drag-mixin.js.map
