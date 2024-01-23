"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.checkMediaQuery = void 0;

const vutils_1 = require("@visactor/vutils"), checkMediaQuery = (query, mediaInfo, globalInstance) => {
    for (const conditionKey in query) switch (conditionKey) {
      case "maxHeight":
        if ((0, vutils_1.isValid)(query.maxHeight) && mediaInfo.height > query.maxHeight) return !1;
        break;

      case "minHeight":
        if ((0, vutils_1.isValid)(query.minHeight) && mediaInfo.height < query.minHeight) return !1;
        break;

      case "maxWidth":
        if ((0, vutils_1.isValid)(query.maxWidth) && mediaInfo.width > query.maxWidth) return !1;
        break;

      case "minWidth":
        if ((0, vutils_1.isValid)(query.minWidth) && mediaInfo.width < query.minWidth) return !1;
        break;

      case "onResize":
        if ((0, vutils_1.isValid)(query.onResize) && !query.onResize(mediaInfo, globalInstance)) return !1;
    }
    return !0;
};

exports.checkMediaQuery = checkMediaQuery;
//# sourceMappingURL=query.js.map
