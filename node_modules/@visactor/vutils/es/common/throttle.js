import debounce from "./debounce";

import isObject from "./isObject";

function throttle(func, wait, options) {
    let leading = !0, trailing = !0;
    if ("function" != typeof func) throw new TypeError("Expected a function");
    return isObject(options) && (leading = "leading" in options ? !!options.leading : leading, 
    trailing = "trailing" in options ? !!options.trailing : trailing), debounce(func, wait, {
        leading: leading,
        trailing: trailing,
        maxWait: wait
    });
}

export default throttle;
//# sourceMappingURL=throttle.js.map
