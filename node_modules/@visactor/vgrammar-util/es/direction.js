export function isHorizontal(direction) {
    return "horizontal" === direction;
}

export function isVertical(direction) {
    return "vertical" === direction;
}

export function isValidDirection(direction) {
    return "vertical" === direction || "horizontal" === direction;
}

export function isValidPosition(position) {
    return "top" === position || "bottom" === position || "left" === position || "right" === position;
}

export function isHorizontalPosition(position) {
    return "top" === position || "bottom" === position;
}
//# sourceMappingURL=direction.js.map