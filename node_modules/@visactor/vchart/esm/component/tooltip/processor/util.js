import { isArray, isValid } from "@visactor/vutils";

export const isMarkInfo = info => isValid(info) && !isArray(info);

export const isDimensionInfo = info => isValid(info) && isArray(info);
//# sourceMappingURL=util.js.map
