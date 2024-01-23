export const clipIn = (element, options, animationParameters) => {
    var _a;
    const clipDimension = element.getGraphicAttribute("clipRangeByDimension", !1), clipRange = null !== (_a = element.getGraphicAttribute("clipRange", !1)) && void 0 !== _a ? _a : 1;
    return options && options.clipDimension ? {
        from: {
            clipRange: 0,
            clipRangeByDimension: options.clipDimension
        },
        to: {
            clipRange: clipRange,
            clipRangeByDimension: clipDimension
        }
    } : {
        from: {
            clipRange: 0
        },
        to: {
            clipRange: clipRange
        }
    };
};

export const clipOut = (element, options, animationParameters) => {
    var _a;
    const clipDimension = element.getGraphicAttribute("clipRangeByDimension", !0), clipRange = null !== (_a = element.getGraphicAttribute("clipRange", !0)) && void 0 !== _a ? _a : 1;
    return options && options.clipDimension ? {
        from: {
            clipRange: clipRange,
            clipRangeByDimension: options.clipDimension
        },
        to: {
            clipRange: 0,
            clipRangeByDimension: clipDimension
        }
    } : {
        from: {
            clipRange: clipRange
        },
        to: {
            clipRange: 0
        }
    };
};
//# sourceMappingURL=clip.js.map
