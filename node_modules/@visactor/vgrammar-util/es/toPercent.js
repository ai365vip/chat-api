import { isNil, isString } from "@visactor/vutils";

export const toPercent = (percent, total) => isNil(percent) ? total : isString(percent) ? total * parseFloat(percent) / 100 : percent;
//# sourceMappingURL=toPercent.js.map