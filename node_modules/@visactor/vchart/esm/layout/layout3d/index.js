import { Layout } from "../base-layout";

import { isXAxis, isYAxis } from "../../component/axis/cartesian/util/common";

import { Factory } from "../../core/factory";

export class Layout3d extends Layout {
    layoutItems(_chart, items, chartLayoutRect, chartViewBox) {
        this._layoutInit(_chart, items, chartLayoutRect, chartViewBox), this._layoutNormalItems(items);
        const layoutTemp = {
            left: this.leftCurrent,
            top: this.topCurrent,
            right: this.rightCurrent,
            bottom: this.bottomCurrent
        }, absoluteItem = items.filter((x => "absolute" === x.layoutType)), zItems = absoluteItem.filter((i => "z" === i.layoutOrient));
        let extraWH = {
            width: 0,
            height: 0
        };
        if (zItems.length) {
            extraWH = zItems[0].getLayoutRect();
        }
        this.leftCurrent += extraWH.width / 8, this.rightCurrent -= extraWH.width / 8, this.topCurrent += extraWH.height / 8, 
        this.bottomCurrent -= extraWH.height / 8;
        const {regionItems: regionItems, relativeItems: relativeItems, relativeOverlapItems: relativeOverlapItems, allRelatives: allRelatives, overlapItems: overlapItems} = this._groupItems(items);
        this.layoutRegionItems(regionItems, relativeItems, relativeOverlapItems, overlapItems), 
        this._processAutoIndent(regionItems, relativeItems, relativeOverlapItems, overlapItems, allRelatives, layoutTemp);
        const absoluteItemExceptZAxis = absoluteItem.filter((i => "z" !== i.layoutOrient));
        this.layoutAbsoluteItems(absoluteItemExceptZAxis);
        const xAxis = relativeItems.filter((item => "axes" === item.model.specKey && isXAxis(item.layoutOrient)))[0], yAxis = relativeItems.filter((item => "axes" === item.model.specKey && isYAxis(item.layoutOrient)))[0];
        if (xAxis && zItems.length) {
            const sp = xAxis.getLayoutStartPoint(), lr = xAxis.getLayoutRect(), zRect = {
                x: "left" === yAxis.layoutOrient ? sp.x + lr.width : sp.x,
                y: sp.y,
                width: this._chartLayoutRect.width,
                height: this._chartLayoutRect.height
            };
            zItems[0].model.directionStr = "left" === yAxis.layoutOrient ? "r2l" : "l2r";
            const xRect = xAxis.getLayoutRect(), yRect = yAxis.getLayoutRect(), box3d = {
                length: zItems[0].getLayoutRect().width,
                width: xRect.width,
                height: yRect.height
            };
            xAxis.model.setLayout3dBox && xAxis.model.setLayout3dBox(box3d), yAxis.model.setLayout3dBox && yAxis.model.setLayout3dBox(box3d), 
            zItems[0].model.setLayout3dBox && zItems[0].model.setLayout3dBox(box3d), this.layoutZAxisItems(zItems, zRect);
        }
    }
    layoutZAxisItems(zItems, zRect) {
        zItems.forEach((item => {
            item.absoluteLayoutInRect(zRect);
        }));
    }
    getItemComputeLayoutRect(item, extraOffset) {
        extraOffset || (extraOffset = {
            offsetLeft: 0,
            offsetRight: 0,
            offsetTop: 0,
            offsetBottom: 0
        });
        return {
            width: this.rightCurrent - this.leftCurrent - item.layoutPaddingLeft - item.layoutPaddingRight - (extraOffset.offsetLeft + extraOffset.offsetRight),
            height: this.bottomCurrent - this.topCurrent - item.layoutPaddingTop - item.layoutPaddingBottom - (extraOffset.offsetTop + extraOffset.offsetBottom)
        };
    }
    _checkAutoIndent(items) {
        const result = {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        }, rightCurrent = this._chartViewBox.x2 - this._chartViewBox.x1 - this.rightCurrent, bottomCurrent = this._chartViewBox.y2 - this._chartViewBox.y1 - this.bottomCurrent;
        return items.forEach((i => {
            if (!i.getModelVisible() || !i.autoIndent) return;
            const vOrH = "left" === i.layoutOrient || "right" === i.layoutOrient, outer = i.getLastComputeOutBounds();
            vOrH ? (result.top = Math.max(result.top, outer.y1 - this.topCurrent), result.bottom = Math.max(result.bottom, outer.y2 - bottomCurrent)) : (result.left = Math.max(result.left, outer.x1 - this.leftCurrent), 
            result.right = Math.max(result.right, outer.x2 - rightCurrent));
        })), result;
    }
}

Layout3d.type = "layout3d";

export const registerLayout3d = () => {
    Factory.registerLayout(Layout3d.type, Layout3d);
};
//# sourceMappingURL=index.js.map
