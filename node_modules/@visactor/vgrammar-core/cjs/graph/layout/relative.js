"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.doRelativeLayout = void 0;

const enums_1 = require("./../enums"), vutils_1 = require("@visactor/vutils"), vgrammar_util_1 = require("@visactor/vgrammar-util"), view_1 = require("../../parse/view"), defaultLayoutOrder = {
    [enums_1.ComponentEnum.axis]: 0,
    [enums_1.ComponentEnum.legend]: 1,
    [enums_1.ComponentEnum.slider]: 2,
    [enums_1.ComponentEnum.player]: 3,
    [enums_1.ComponentEnum.datazoom]: 4
}, getLayoutOrderOfMark = mark => {
    var _a, _b, _c;
    return null !== (_b = null === (_a = mark.getSpec().layout) || void 0 === _a ? void 0 : _a.order) && void 0 !== _b ? _b : "component" === mark.markType && null !== (_c = defaultLayoutOrder[mark.componentType]) && void 0 !== _c ? _c : 1 / 0;
}, doRelativeLayout = (group, children, parentLayoutBounds, options) => {
    const viewBounds = parentLayoutBounds.clone(), groupLayoutSpec = group.getSpec().layout, maxChildWidth = (0, 
    vgrammar_util_1.toPercent)(groupLayoutSpec.maxChildWidth, viewBounds.width()), maxChildHeight = (0, 
    vgrammar_util_1.toPercent)(groupLayoutSpec.maxChildHeight, viewBounds.width());
    let minDeltaX1 = 0, minDeltaX2 = 0, minDeltaY1 = 0, minDeltaY2 = 0;
    children.forEach((child => {
        const layoutSpec = child.getSpec().layout, padding = (0, view_1.normalizePadding)(layoutSpec.padding), bounds = options.parseMarkBounds ? options.parseMarkBounds(child.getBounds(), child) : child.getBounds();
        if ("top" === layoutSpec.position || "bottom" === layoutSpec.position) {
            const childHeight = Math.min(bounds.height() + padding.top + padding.bottom, maxChildHeight);
            "top" === layoutSpec.position ? viewBounds.y1 += childHeight : viewBounds.y2 -= childHeight, 
            bounds.x1 < parentLayoutBounds.x1 && (minDeltaX1 = Math.max(minDeltaX1, parentLayoutBounds.x1 - bounds.x1)), 
            bounds.x2 > parentLayoutBounds.x2 && (minDeltaX2 = Math.max(minDeltaX2, bounds.x2 - parentLayoutBounds.x2));
        }
        if ("left" === layoutSpec.position || "right" === layoutSpec.position) {
            const childWidth = Math.min(bounds.width() + padding.left + padding.right, maxChildWidth);
            "left" === layoutSpec.position ? viewBounds.x1 += childWidth : viewBounds.x2 -= childWidth, 
            bounds.y1 < parentLayoutBounds.y1 && (minDeltaY1 = Math.max(minDeltaY1, parentLayoutBounds.y1 - bounds.y1)), 
            bounds.y2 > parentLayoutBounds.y2 && (minDeltaY2 = Math.max(minDeltaY2, bounds.y2 - parentLayoutBounds.y2));
        }
        "outside" === layoutSpec.position && (viewBounds.x1 += Math.max(parentLayoutBounds.x1 - bounds.x1, 0) + padding.left, 
        viewBounds.x2 -= Math.max(bounds.x2 - parentLayoutBounds.x2, 0) + padding.right, 
        viewBounds.y1 += Math.max(parentLayoutBounds.y1 - bounds.y1, 0) + padding.top, viewBounds.y2 -= Math.max(bounds.y2 - parentLayoutBounds.y2) + padding.bottom);
    })), minDeltaX1 > viewBounds.x1 - parentLayoutBounds.x1 && minDeltaX1 < parentLayoutBounds.width() && (viewBounds.x1 = parentLayoutBounds.x1 + minDeltaX1), 
    minDeltaX2 > parentLayoutBounds.x2 - viewBounds.x2 && minDeltaX2 < parentLayoutBounds.width() && (viewBounds.x2 = parentLayoutBounds.x2 - minDeltaX2), 
    minDeltaY1 > viewBounds.y1 - parentLayoutBounds.y1 && minDeltaY1 < parentLayoutBounds.height() && (viewBounds.y1 = parentLayoutBounds.y1 + minDeltaY1), 
    minDeltaY2 > parentLayoutBounds.y2 - viewBounds.y2 && minDeltaY2 < parentLayoutBounds.height() && (viewBounds.y2 = parentLayoutBounds.y2 - minDeltaY2);
    let curTopY = viewBounds.y1, curBottomY = viewBounds.y2, curLeftX = viewBounds.x1, curRightX = viewBounds.x2;
    const sortedChildren = children.slice().sort(((markA, markB) => getLayoutOrderOfMark(markA) - getLayoutOrderOfMark(markB)));
    for (let i = 0, len = sortedChildren.length; i < len; i++) {
        const child = sortedChildren[i], layoutSpec = child.getSpec().layout, padding = (0, 
        view_1.normalizePadding)(layoutSpec.padding), bounds = options.parseMarkBounds ? options.parseMarkBounds(child.getBounds(), child) : child.getBounds();
        if ("top" === layoutSpec.position || "bottom" === layoutSpec.position) {
            const childHeight = Math.min(bounds.height() + padding.top + padding.bottom, maxChildHeight);
            if ("top" === layoutSpec.position ? (child.layoutBounds = (new vutils_1.Bounds).set(viewBounds.x1, curTopY - childHeight, viewBounds.x2, curTopY), 
            curTopY -= childHeight) : (child.layoutBounds = (new vutils_1.Bounds).set(viewBounds.x1, curBottomY, viewBounds.x2, curBottomY + childHeight), 
            curBottomY += childHeight), child.relativePosition = {
                top: child.layoutBounds.y1 - viewBounds.y1,
                bottom: child.layoutBounds.y1 - viewBounds.y2
            }, layoutSpec.align) {
                const childWidth = bounds.width() + padding.left + padding.right;
                childWidth < viewBounds.width() && ("center" === layoutSpec.align ? (child.layoutBounds.x1 = (viewBounds.x1 + viewBounds.x2) / 2 - childWidth / 2, 
                child.layoutBounds.x2 = child.layoutBounds.x1 + childWidth, child.relativePosition.left = child.relativePosition.right = (viewBounds.width() - childWidth) / 2) : "right" === layoutSpec.align ? (child.layoutBounds.x1 = viewBounds.x2 - childWidth, 
                child.layoutBounds.x2 = viewBounds.x2, child.relativePosition.right = 0, child.relativePosition.left = viewBounds.width() - childWidth) : "left" === layoutSpec.align && (child.layoutBounds.x1 = viewBounds.x1, 
                child.layoutBounds.x2 = viewBounds.x1 + childWidth, child.relativePosition.left = 0, 
                child.relativePosition.right = viewBounds.width() - childWidth));
            }
        } else if ("left" === layoutSpec.position || "right" === layoutSpec.position) {
            const childWidth = Math.min(bounds.width() + padding.left + padding.right, maxChildWidth);
            if ("left" === layoutSpec.position ? (child.layoutBounds = (new vutils_1.Bounds).set(curLeftX - childWidth, viewBounds.y1, curLeftX, viewBounds.y2), 
            curLeftX -= childWidth) : (child.layoutBounds = (new vutils_1.Bounds).set(curRightX, viewBounds.y1, curRightX + childWidth, viewBounds.y2), 
            curRightX += childWidth), child.relativePosition = {
                left: child.layoutBounds.x1 - viewBounds.x1,
                right: child.layoutBounds.x1 - viewBounds.x2
            }, layoutSpec.align) {
                const childHeight = bounds.height() + padding.top + padding.bottom;
                childWidth < viewBounds.width() && ("middle" === layoutSpec.align ? (child.layoutBounds.y1 = (viewBounds.y1 + viewBounds.y2) / 2 - childHeight / 2, 
                child.layoutBounds.y2 = child.layoutBounds.y1 + childHeight, child.relativePosition.top = child.relativePosition.bottom = (viewBounds.height() - childHeight) / 2) : "bottom" === layoutSpec.align ? (child.layoutBounds.y1 = viewBounds.y2 - childHeight, 
                child.layoutBounds.y2 = viewBounds.y2, child.relativePosition.top = viewBounds.height() - childHeight, 
                child.relativePosition.bottom = 0) : "top" === layoutSpec.align && (child.layoutBounds.y1 = viewBounds.y1, 
                child.layoutBounds.y2 = viewBounds.y1 + childHeight, child.relativePosition.bottom = viewBounds.height() - childHeight, 
                child.relativePosition.top = 0));
            }
        } else "outside" === layoutSpec.position ? (curLeftX -= Math.max(parentLayoutBounds.x1 - bounds.x1, 0) + padding.left, 
        curRightX -= Math.max(bounds.x2 - parentLayoutBounds.x2, 0) + padding.right, curTopY -= Math.max(parentLayoutBounds.y1 - bounds.y1, 0) + padding.top, 
        curBottomY += Math.max(bounds.y2 - parentLayoutBounds.y2) + padding.bottom) : child.layoutBounds = viewBounds;
    }
    return viewBounds;
};

exports.doRelativeLayout = doRelativeLayout;
//# sourceMappingURL=relative.js.map
