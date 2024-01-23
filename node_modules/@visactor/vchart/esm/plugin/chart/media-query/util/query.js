import { isValid } from "@visactor/vutils";

export const checkMediaQuery = (query, mediaInfo, globalInstance) => {
    for (const conditionKey in query) switch (conditionKey) {
      case "maxHeight":
        if (isValid(query.maxHeight) && mediaInfo.height > query.maxHeight) return !1;
        break;

      case "minHeight":
        if (isValid(query.minHeight) && mediaInfo.height < query.minHeight) return !1;
        break;

      case "maxWidth":
        if (isValid(query.maxWidth) && mediaInfo.width > query.maxWidth) return !1;
        break;

      case "minWidth":
        if (isValid(query.minWidth) && mediaInfo.width < query.minWidth) return !1;
        break;

      case "onResize":
        if (isValid(query.onResize) && !query.onResize(mediaInfo, globalInstance)) return !1;
    }
    return !0;
};
//# sourceMappingURL=query.js.map
