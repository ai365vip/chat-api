import isObject from "./isObject";

import isValidNumber from "./isValidNumber";

let hasRaf = !1;

try {
    hasRaf = "function" == typeof requestAnimationFrame && "function" == typeof cancelAnimationFrame;
} catch (err) {
    hasRaf = !1;
}

function debounce(func, wait, options) {
    let lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = !1, maxing = !1, trailing = !0;
    const useRAF = !wait && 0 !== wait && hasRaf;
    if ("function" != typeof func) throw new TypeError("Expected a function");
    function invokeFunc(time) {
        const args = lastArgs, thisArg = lastThis;
        return lastArgs = lastThis = void 0, lastInvokeTime = time, result = func.apply(thisArg, args), 
        result;
    }
    function startTimer(pendingFunc, wait) {
        return useRAF ? (cancelAnimationFrame(timerId), requestAnimationFrame(pendingFunc)) : setTimeout(pendingFunc, wait);
    }
    function shouldInvoke(time) {
        const timeSinceLastCall = time - lastCallTime;
        return void 0 === lastCallTime || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && time - lastInvokeTime >= maxWait;
    }
    function timerExpired() {
        const time = Date.now();
        if (shouldInvoke(time)) return trailingEdge(time);
        timerId = startTimer(timerExpired, function(time) {
            const timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - (time - lastCallTime);
            return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
        }(time));
    }
    function trailingEdge(time) {
        return timerId = void 0, trailing && lastArgs ? invokeFunc(time) : (lastArgs = lastThis = void 0, 
        result);
    }
    function debounced(...args) {
        const time = Date.now(), isInvoking = shouldInvoke(time);
        if (lastArgs = args, lastThis = this, lastCallTime = time, isInvoking) {
            if (void 0 === timerId) return function(time) {
                return lastInvokeTime = time, timerId = startTimer(timerExpired, wait), leading ? invokeFunc(time) : result;
            }(lastCallTime);
            if (maxing) return timerId = startTimer(timerExpired, wait), invokeFunc(lastCallTime);
        }
        return void 0 === timerId && (timerId = startTimer(timerExpired, wait)), result;
    }
    return wait = +wait || 0, isObject(options) && (leading = !!options.leading, maxing = "maxWait" in options, 
    maxing && (maxWait = Math.max(isValidNumber(options.maxWait) ? options.maxWait : 0, wait)), 
    trailing = "trailing" in options ? !!options.trailing : trailing), debounced.cancel = function() {
        void 0 !== timerId && function(id) {
            if (useRAF) return cancelAnimationFrame(id);
            clearTimeout(id);
        }(timerId), lastInvokeTime = 0, lastArgs = lastCallTime = lastThis = timerId = void 0;
    }, debounced.flush = function() {
        return void 0 === timerId ? result : trailingEdge(Date.now());
    }, debounced.pending = function() {
        return void 0 !== timerId;
    }, debounced;
}

hasRaf = !1;

export default debounce;
//# sourceMappingURL=debounce.js.map