"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Arranger = void 0;

const vutils_1 = require("@visactor/vutils");

class Arranger {
    constructor(animators) {
        this.parallelArrangers = [ this ], this.totalTime = 0, this.startTime = 0, this.endTime = 0, 
        this.animators = animators.filter((animator => !(0, vutils_1.isNil)(animator))), 
        this.totalTime = this.animators.reduce(((time, animator) => Math.max(time, animator.getTotalAnimationTime())), 0);
    }
    parallel(arranger) {
        const parallelArrangers = Array.from(new Set(this.parallelArrangers.concat(arranger.parallelArrangers)));
        return parallelArrangers.forEach((arranger => {
            arranger.parallelArrangers = parallelArrangers;
        })), this.arrangeTime(), this;
    }
    after(arranger) {
        return this.afterArranger = arranger, this.arrangeTime(), this;
    }
    arrangeTime() {
        const parallelTime = this.parallelArrangers.reduce(((time, arranger) => Math.max(time, arranger.totalTime)), this.totalTime), startTime = this.parallelArrangers.reduce(((time, arranger) => {
            var _a, _b;
            return Math.max(time, null !== (_b = null === (_a = arranger.afterArranger) || void 0 === _a ? void 0 : _a.endTime) && void 0 !== _b ? _b : 0);
        }), 0);
        this.parallelArrangers.forEach((arranger => {
            arranger.startTime = startTime, arranger.endTime = startTime + parallelTime, arranger.animators.forEach((animator => {
                animator.startAt(startTime);
            }));
        }));
    }
}

exports.Arranger = Arranger;
//# sourceMappingURL=arranger.js.map
