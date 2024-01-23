"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.defaultTimeline = exports.DefaultTimeline = void 0;

const enums_1 = require("../common/enums"), generator_1 = require("../common/generator");

class DefaultTimeline {
    constructor() {
        this.id = generator_1.Generator.GenAutoIncrementId(), this.animateHead = null, this.animateTail = null, 
        this.animateCount = 0, this.paused = !1;
    }
    addAnimate(animate) {
        this.animateTail ? (this.animateTail.nextAnimate = animate, animate.prevAnimate = this.animateTail, 
        this.animateTail = animate, animate.nextAnimate = null) : (this.animateHead = animate, 
        this.animateTail = animate), this.animateCount++;
    }
    pause() {
        this.paused = !0;
    }
    resume() {
        this.paused = !1;
    }
    tick(delta) {
        if (this.paused) return;
        let animate = this.animateHead;
        for (this.animateCount = 0; animate; ) animate.status === enums_1.AnimateStatus.END ? this.removeAnimate(animate) : animate.status === enums_1.AnimateStatus.RUNNING || animate.status === enums_1.AnimateStatus.INITIAL ? (this.animateCount++, 
        animate.advance(delta)) : animate.status === enums_1.AnimateStatus.PAUSED && this.animateCount++, 
        animate = animate.nextAnimate;
    }
    clear() {
        let animate = this.animateHead;
        for (;animate; ) animate.release(), animate = animate.nextAnimate;
        this.animateHead = null, this.animateTail = null, this.animateCount = 0;
    }
    removeAnimate(animate, release = !0) {
        animate._onRemove && animate._onRemove.forEach((cb => cb())), animate === this.animateHead ? (this.animateHead = animate.nextAnimate, 
        animate === this.animateTail ? this.animateTail = null : this.animateHead.prevAnimate = null) : animate === this.animateTail ? (this.animateTail = animate.prevAnimate, 
        this.animateTail.nextAnimate = null) : (animate.prevAnimate.nextAnimate = animate.nextAnimate, 
        animate.nextAnimate.prevAnimate = animate.prevAnimate), release && animate.release();
    }
}

exports.DefaultTimeline = DefaultTimeline, exports.defaultTimeline = new DefaultTimeline;
//# sourceMappingURL=timeline.js.map