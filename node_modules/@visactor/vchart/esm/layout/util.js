import { isNil, last } from "@visactor/vutils";

function getPositionItems(items) {
    const startItems = [], middleItems = [], endItems = [];
    return items.forEach((item => {
        isNil(item.getSpec().position) || "start" === item.getSpec().position ? startItems.push(item) : "middle" === item.getSpec().position ? middleItems.push(item) : "end" === item.getSpec().position && endItems.push(item);
    })), {
        startItems: startItems,
        endItems: endItems,
        middleItems: middleItems
    };
}

function adjustItemsToCenter(allItems, isVertical, containerLength) {
    isVertical ? allItems.forEach((items => {
        const lastItem = last(items), length = lastItem.getLayoutStartPoint().y + lastItem.getLayoutRect().height - items[0].getLayoutStartPoint().y, centerY = (containerLength - length) / 2;
        items.forEach((item => {
            item.setLayoutStartPosition({
                x: item.getLayoutStartPoint().x,
                y: item.getLayoutStartPoint().y + centerY
            });
        }));
    })) : allItems.forEach((items => {
        const lastItem = last(items), length = lastItem.getLayoutStartPoint().x + lastItem.getLayoutRect().width - items[0].getLayoutStartPoint().x, centerX = (containerLength - length) / 2;
        items.forEach((item => {
            item.setLayoutStartPosition({
                x: item.getLayoutStartPoint().x + centerX,
                y: item.getLayoutStartPoint().y
            });
        }));
    }));
}

function alignSelfOfItems(allItems, isVertical, maxSizes, sign) {
    let maxSize;
    allItems.forEach(((lineItems, index) => {
        lineItems.length > 1 && (maxSize = maxSizes[index], lineItems.forEach((item => {
            if (!item.alignSelf || "start" === item.alignSelf) return;
            const pos = item.getLayoutStartPoint(), ratio = "middle" === item.alignSelf ? .5 : 1, delta = isVertical ? maxSize - (item.getLayoutRect().width + item.layoutPaddingLeft + item.layoutPaddingRight) : maxSize - (item.getLayoutRect().height + item.layoutPaddingTop + item.layoutPaddingBottom);
            isVertical ? item.setLayoutStartPosition({
                x: pos.x + sign * delta * ratio,
                y: pos.y
            }) : item.setLayoutStartPosition({
                x: pos.x,
                y: pos.y + sign * delta * ratio
            });
        })));
    }));
}

function layoutLeftRightStartOrMiddleItems(items, layout, limitHeight, isMiddle, position) {
    if (items.length) {
        let maxWidth = 0;
        const isRight = "right" === position, xSign = isRight ? -1 : 1;
        let preX = isRight ? layout.rightCurrent : layout.leftCurrent, preTop = layout.topCurrent;
        const allItems = [];
        let singleLineItems = [];
        const maxWidths = [];
        items.forEach((item => {
            const layoutRect = layout.getItemComputeLayoutRect(item), rect = item.computeBoundsInRect(layoutRect);
            item.setLayoutRect(rect);
            const itemTotalHeight = rect.height + item.layoutPaddingTop + item.layoutPaddingBottom, itemTotalWidth = rect.width + item.layoutPaddingLeft + item.layoutPaddingRight, itemOffsetX = isRight ? -rect.width - item.layoutPaddingRight : item.layoutPaddingLeft;
            item.setLayoutStartPosition({
                x: preX + item.layoutOffsetX + itemOffsetX,
                y: preTop + item.layoutOffsetY + item.layoutPaddingTop
            }), preTop += itemTotalHeight, preTop > limitHeight && singleLineItems.length ? (maxWidths.push(maxWidth), 
            preX += xSign * maxWidth, maxWidth = itemTotalWidth, preTop = layout.topCurrent + itemTotalHeight, 
            item.setLayoutStartPosition({
                x: preX + item.layoutOffsetX + itemOffsetX,
                y: layout.topCurrent + item.layoutOffsetY + item.layoutPaddingTop
            }), allItems.push(singleLineItems), singleLineItems = [ item ]) : (maxWidth = Math.max(maxWidth, itemTotalWidth), 
            singleLineItems.push(item));
        })), maxWidths.push(maxWidth), allItems.push(singleLineItems), alignSelfOfItems(allItems, !0, maxWidths, xSign), 
        isMiddle && adjustItemsToCenter(allItems, !0, limitHeight), isRight ? layout.rightCurrent = preX + xSign * maxWidth : layout.leftCurrent = preX + xSign * maxWidth;
    }
}

function layoutLeftRightEndItems(items, layout, limitWidth, position) {
    if (items.length) {
        let maxWidth = 0;
        const isRight = "right" === position, xSign = isRight ? -1 : 1;
        let preX = isRight ? layout.rightCurrent : layout.leftCurrent, preBottom = layout.bottomCurrent;
        const allItems = [];
        let singleLineItems = [];
        const maxWidths = [];
        items.forEach((item => {
            const layoutRect = layout.getItemComputeLayoutRect(item), rect = item.computeBoundsInRect(layoutRect);
            item.setLayoutRect(rect);
            const itemTotalHeight = rect.height + item.layoutPaddingTop + item.layoutPaddingBottom, itemTotalWidth = rect.width + item.layoutPaddingLeft + item.layoutPaddingRight, itemOffsetX = isRight ? -rect.width - item.layoutPaddingRight : item.layoutPaddingLeft;
            preBottom < itemTotalHeight && singleLineItems.length ? (maxWidths.push(maxWidth), 
            preX += xSign * maxWidth, maxWidth = itemTotalWidth, preBottom = layout.bottomCurrent, 
            item.setLayoutStartPosition({
                x: preX + item.layoutOffsetX + itemOffsetX,
                y: preBottom + item.layoutOffsetY - rect.height - item.layoutPaddingBottom
            }), allItems.push(singleLineItems), singleLineItems = [ item ]) : (item.setLayoutStartPosition({
                x: preX + item.layoutOffsetX + itemOffsetX,
                y: preBottom + item.layoutOffsetY - rect.height - item.layoutPaddingBottom
            }), maxWidth = Math.max(maxWidth, itemTotalWidth), preBottom -= itemTotalHeight, 
            singleLineItems.push(item));
        })), maxWidths.push(maxWidth), allItems.push(singleLineItems), alignSelfOfItems(allItems, !0, maxWidths, xSign), 
        isRight ? layout.rightCurrent = preX + xSign * maxWidth : layout.leftCurrent = preX + xSign * maxWidth;
    }
}

function layoutTopBottomStartOrMiddleItems(items, layout, limitWidth, isMiddle, position) {
    if (items.length) {
        const isTop = "top" === position, ySign = isTop ? 1 : -1;
        let maxHeight = 0, preLeft = layout.leftCurrent, preY = isTop ? layout.topCurrent : layout.bottomCurrent;
        const allItems = [];
        let singleLineItems = [];
        const maxHeights = [];
        items.forEach((item => {
            const layoutRect = layout.getItemComputeLayoutRect(item), rect = item.computeBoundsInRect(layoutRect);
            item.setLayoutRect(rect);
            const itemTotalHeight = rect.height + item.layoutPaddingTop + item.layoutPaddingBottom, itemTotalWidth = rect.width + item.layoutPaddingLeft + item.layoutPaddingRight, itemOffsetY = isTop ? item.layoutPaddingTop : -rect.height - item.layoutPaddingBottom;
            item.setLayoutStartPosition({
                x: preLeft + item.layoutOffsetX + item.layoutPaddingLeft,
                y: preY + item.layoutOffsetY + itemOffsetY
            }), preLeft += itemTotalWidth, preLeft > limitWidth && singleLineItems.length ? (maxHeights.push(maxHeight), 
            preLeft = layout.leftCurrent + itemTotalWidth, preY += ySign * maxHeight, maxHeight = itemTotalHeight, 
            item.setLayoutStartPosition({
                x: layout.leftCurrent + item.layoutOffsetX + item.layoutPaddingLeft,
                y: preY + item.layoutOffsetY + itemOffsetY
            }), allItems.push(singleLineItems), singleLineItems = [ item ]) : (maxHeight = Math.max(maxHeight, itemTotalHeight), 
            singleLineItems.push(item));
        })), maxHeights.push(maxHeight), allItems.push(singleLineItems), alignSelfOfItems(allItems, !1, maxHeights, ySign), 
        isMiddle && adjustItemsToCenter(allItems, !1, limitWidth), isTop ? layout.topCurrent = preY + ySign * maxHeight : layout.bottomCurrent = preY + ySign * maxHeight;
    }
}

function layoutTopBottomEndItems(items, layout, limitWidth, position) {
    if (items.length) {
        const isTop = "top" === position, ySign = isTop ? 1 : -1;
        let maxHeight = 0, preRight = layout.rightCurrent, preY = isTop ? layout.topCurrent : layout.bottomCurrent;
        const allItems = [];
        let singleLineItems = [];
        const maxHeights = [];
        items.forEach((item => {
            const layoutRect = layout.getItemComputeLayoutRect(item), rect = item.computeBoundsInRect(layoutRect);
            item.setLayoutRect(rect);
            const itemTotalHeight = rect.height + item.layoutPaddingTop + item.layoutPaddingBottom, itemTotalWidth = rect.width + item.layoutPaddingLeft + item.layoutPaddingRight, itemOffsetY = isTop ? item.layoutPaddingTop : -rect.height - item.layoutPaddingBottom;
            preRight < itemTotalWidth && singleLineItems.length ? (preRight = layout.rightCurrent, 
            preY += ySign * maxHeight, maxHeight = itemTotalHeight, item.setLayoutStartPosition({
                x: layout.rightCurrent + item.layoutOffsetX - rect.width - item.layoutPaddingRight,
                y: preY + item.layoutOffsetY + itemOffsetY
            }), allItems.push(singleLineItems), singleLineItems = [ item ]) : (singleLineItems.push(item), 
            item.setLayoutStartPosition({
                x: preRight + item.layoutOffsetX - rect.width - item.layoutPaddingRight,
                y: preY + item.layoutOffsetY + itemOffsetY
            }), maxHeight = Math.max(maxHeight, itemTotalHeight), preRight -= itemTotalWidth);
        })), maxHeights.push(maxHeight), allItems.push(singleLineItems), alignSelfOfItems(allItems, !1, maxHeights, ySign), 
        isTop ? layout.topCurrent = preY + ySign * maxHeight : layout.bottomCurrent = preY + ySign * maxHeight;
    }
}

export function layoutLeftInlineItems(items, layout, limitHeight) {
    const {startItems: startItems, middleItems: middleItems, endItems: endItems} = getPositionItems(items);
    startItems.length && layoutLeftRightStartOrMiddleItems(startItems, layout, limitHeight, !1, "left"), 
    middleItems.length && layoutLeftRightStartOrMiddleItems(middleItems, layout, limitHeight, !0, "left"), 
    endItems.length && layoutLeftRightEndItems(endItems, layout, limitHeight, "left");
}

export function layoutRightInlineItems(items, layout, limitHeight) {
    const {startItems: startItems, middleItems: middleItems, endItems: endItems} = getPositionItems(items);
    startItems.length && layoutLeftRightStartOrMiddleItems(startItems, layout, limitHeight, !1, "right"), 
    middleItems.length && layoutLeftRightStartOrMiddleItems(middleItems, layout, limitHeight, !0, "right"), 
    endItems.length && layoutLeftRightEndItems(endItems, layout, limitHeight, "right");
}

export function layoutTopInlineItems(items, layout, limitWidth) {
    const {startItems: startItems, middleItems: middleItems, endItems: endItems} = getPositionItems(items);
    startItems.length && layoutTopBottomStartOrMiddleItems(startItems, layout, limitWidth, !1, "top"), 
    middleItems.length && layoutTopBottomStartOrMiddleItems(middleItems, layout, limitWidth, !0, "top"), 
    endItems.length && layoutTopBottomEndItems(endItems, layout, limitWidth, "top");
}

export function layoutBottomInlineItems(items, layout, limitWidth) {
    const {startItems: startItems, middleItems: middleItems, endItems: endItems} = getPositionItems(items);
    startItems.length && layoutTopBottomStartOrMiddleItems(startItems, layout, limitWidth, !1, "bottom"), 
    middleItems.length && layoutTopBottomStartOrMiddleItems(middleItems, layout, limitWidth, !0, "bottom"), 
    endItems.length && layoutTopBottomEndItems(endItems, layout, limitWidth, "bottom");
}
//# sourceMappingURL=util.js.map
