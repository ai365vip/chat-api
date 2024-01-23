import * as ERROR_MSGS from "../constants/error_msgs";

export function isStackOverflowExeption(error) {
    return error instanceof RangeError || error.message === ERROR_MSGS.STACK_OVERFLOW;
}

export const tryAndThrowErrorIfStackOverflow = (fn, errorCallback) => fn();
//# sourceMappingURL=exceptions.js.map
