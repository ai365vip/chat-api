import { isNumber } from "@visactor/vutils";

export function transformPadding(padding) {
    if (isNumber(padding)) return padding;
    return [ padding.top ? padding.top : 0, padding.right ? padding.right : 0, padding.bottom ? padding.bottom : 0, padding.left ? padding.left : 0 ];
}
//# sourceMappingURL=utils.js.map
