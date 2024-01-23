import { isNil } from "@visactor/vutils";

import { extent } from "@visactor/vgrammar-util";

import { getBandWidthOfScale } from "../../util/scale";

const jitterByChannel = (options, upstreamData, channel) => {
    var _a, _b, _c, _d;
    const mark = upstreamData[0].mark, scale = null === (_a = mark.getScalesByChannel()) || void 0 === _a ? void 0 : _a[channel], random = null !== (_b = options.random) && void 0 !== _b ? _b : Math.random, ratio = Math.min(null !== (_c = "x" === channel ? options.widthRatio : options.heightRatio) && void 0 !== _c ? _c : .4, .5), bandSize = null !== (_d = "x" === channel ? options.bandWidth : options.bandHeight) && void 0 !== _d ? _d : getBandWidthOfScale(scale);
    if (isNil(bandSize)) {
        let domain = extent(upstreamData, (el => el.getItemAttribute(channel)));
        if (isNil(domain[0]) || isNil(domain[1]) || domain[0] === domain[1]) {
            const viewBox = mark.view.getViewBox();
            domain = "x" === channel ? [ viewBox.x1, viewBox.x2 ] : [ viewBox.y1, viewBox.y2 ];
        }
        const length = upstreamData.length;
        upstreamData.forEach(((element, index) => {
            element.setItemAttributes({
                [channel]: domain[0] + (domain[1] - domain[0]) * random(index, length)
            });
        }));
    } else {
        const length = upstreamData.length;
        upstreamData.forEach(((element, index) => {
            const val = element.getItemAttribute(channel), domain = [ val - ratio * bandSize, val + ratio * bandSize ];
            element.setItemAttributes({
                [channel]: domain[0] + (domain[1] - domain[0]) * random(index, length)
            });
        }));
    }
};

export const jitterY = (options, upstreamData) => {
    var _a;
    return upstreamData && 0 !== upstreamData.length && (null === (_a = upstreamData[0]) || void 0 === _a ? void 0 : _a.mark) ? jitterByChannel(options, upstreamData, "y") : upstreamData;
};

export const jitterX = (options, upstreamData) => {
    var _a;
    return upstreamData && 0 !== upstreamData.length && (null === (_a = upstreamData[0]) || void 0 === _a ? void 0 : _a.mark) ? jitterByChannel(options, upstreamData, "x") : upstreamData;
};

export const transform = (options, upstreamData) => {
    var _a;
    return upstreamData && 0 !== upstreamData.length && (null === (_a = upstreamData[0]) || void 0 === _a ? void 0 : _a.mark) ? (jitterByChannel(options, upstreamData, "x"), 
    jitterByChannel(options, upstreamData, "y"), upstreamData) : upstreamData;
};
//# sourceMappingURL=jitter.js.map
