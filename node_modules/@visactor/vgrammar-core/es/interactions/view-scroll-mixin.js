import { isNil } from "@visactor/vutils";

import { handleScrolling } from "./view-utils";

export class ViewScrollMixin {
    formatPanScroll(e) {
        return e;
    }
    formatWheelScroll(e) {
        return e.ctrlKey || 0 === e.deltaY && 0 === e.deltaX || (e.scrollX = e.deltaX, e.scrollY = e.deltaY), 
        e;
    }
    formatScrollEvent(e) {
        return e ? "pan" === e.type ? this.formatPanScroll(e) : "wheel" === e.type ? this.formatWheelScroll(e) : e : e;
    }
    handleScrollStart(e, navState, scrollOptions) {
        if (e.stopPropagation(), e.preventDefault(), !isNil(e.scrollX) || !isNil(e.scrollY)) {
            if (scrollOptions && scrollOptions.realtime) return handleScrolling({
                x: e.scrollX,
                y: e.scrollY
            }, navState, scrollOptions);
            isNil(e.scrollX) || (this._scrollX = isNil(this._scrollX) ? e.scrollX : this._scrollX + e.scrollX), 
            isNil(e.scrollY) || (this._scrollY = isNil(this._scrollY) ? e.scrollY : this._scrollY + e.scrollY);
        }
    }
    handleScrollEnd(e, navState, scrollOptions) {
        if (!1 === (null == scrollOptions ? void 0 : scrollOptions.realtime) && (isNil(this._scrollX) || isNil(this._scrollY))) {
            const res = handleScrolling({
                x: this._scrollX,
                y: this._scrollY
            }, navState, scrollOptions);
            return this._scrollX = null, this._scrollY = null, res;
        }
        return null;
    }
}
//# sourceMappingURL=view-scroll-mixin.js.map
