"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.ViewScrollMixin = void 0;

const vutils_1 = require("@visactor/vutils"), view_utils_1 = require("./view-utils");

class ViewScrollMixin {
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
        if (e.stopPropagation(), e.preventDefault(), !(0, vutils_1.isNil)(e.scrollX) || !(0, 
        vutils_1.isNil)(e.scrollY)) {
            if (scrollOptions && scrollOptions.realtime) return (0, view_utils_1.handleScrolling)({
                x: e.scrollX,
                y: e.scrollY
            }, navState, scrollOptions);
            (0, vutils_1.isNil)(e.scrollX) || (this._scrollX = (0, vutils_1.isNil)(this._scrollX) ? e.scrollX : this._scrollX + e.scrollX), 
            (0, vutils_1.isNil)(e.scrollY) || (this._scrollY = (0, vutils_1.isNil)(this._scrollY) ? e.scrollY : this._scrollY + e.scrollY);
        }
    }
    handleScrollEnd(e, navState, scrollOptions) {
        if (!1 === (null == scrollOptions ? void 0 : scrollOptions.realtime) && ((0, vutils_1.isNil)(this._scrollX) || (0, 
        vutils_1.isNil)(this._scrollY))) {
            const res = (0, view_utils_1.handleScrolling)({
                x: this._scrollX,
                y: this._scrollY
            }, navState, scrollOptions);
            return this._scrollX = null, this._scrollY = null, res;
        }
        return null;
    }
}

exports.ViewScrollMixin = ViewScrollMixin;
//# sourceMappingURL=view-scroll-mixin.js.map
