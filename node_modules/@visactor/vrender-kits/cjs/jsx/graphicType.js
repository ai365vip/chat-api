"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.VRichText = exports.VText = exports.VSymbol = exports.VRect3d = exports.VRect = exports.VPyramid3d = exports.VPolygon = exports.VPath = exports.VLine = exports.VImage = exports.VGlyph = exports.VGroup = exports.VCircle = exports.VArea = exports.VArc3d = exports.VArc = exports.REACT_TO_CANOPUS_EVENTS_LIST = exports.REACT_TO_CANOPUS_EVENTS = void 0;

const vrender_core_1 = require("@visactor/vrender-core");

function VArc(params) {
    return vrender_core_1.graphicCreator.arc(params ? params.attribute : {});
}

function VArc3d(params) {
    return vrender_core_1.graphicCreator.arc3d(params ? params.attribute : {});
}

function VArea(params) {
    return vrender_core_1.graphicCreator.area(params ? params.attribute : {});
}

function VCircle(params) {
    return vrender_core_1.graphicCreator.circle(params ? params.attribute : {});
}

function VGroup(params) {
    return vrender_core_1.graphicCreator.group(params ? params.attribute : {});
}

function VGlyph(params) {
    return vrender_core_1.graphicCreator.glyph(params ? params.attribute : {});
}

function VImage(params) {
    return vrender_core_1.graphicCreator.image(params ? params.attribute : {});
}

function VLine(params) {
    return vrender_core_1.graphicCreator.line(params ? params.attribute : {});
}

function VPath(params) {
    return vrender_core_1.graphicCreator.path(params ? params.attribute : {});
}

function VPolygon(params) {
    return vrender_core_1.graphicCreator.polygon(params ? params.attribute : {});
}

function VPyramid3d(params) {
    return vrender_core_1.graphicCreator.pyramid3d(params ? params.attribute : {});
}

function VRect(params) {
    return vrender_core_1.graphicCreator.rect(params ? params.attribute : {});
}

function VRect3d(params) {
    return vrender_core_1.graphicCreator.rect3d(params ? params.attribute : {});
}

function VSymbol(params) {
    return vrender_core_1.graphicCreator.symbol(params ? params.attribute : {});
}

function VText(params) {
    return vrender_core_1.graphicCreator.text(params ? params.attribute : {});
}

function VRichText(params) {
    return vrender_core_1.graphicCreator.richtext(params ? params.attribute : {});
}

exports.REACT_TO_CANOPUS_EVENTS = {
    onPointerDown: "pointerdown",
    onPointerUp: "pointerup",
    onPointerUpOutside: "pointerupoutside",
    onPointerTap: "pointertap",
    onPointerOver: "pointerover",
    onPointerMove: "pointermove",
    onPointerEnter: "pointerenter",
    onPointerLeave: "pointerleave",
    onPointerOut: "pointerout",
    onMouseDown: "mousedown",
    onMouseUp: "mouseup",
    onMouseUpOutside: "mouseupoutside",
    onMouseMove: "mousemove",
    onMouseOver: "mouseover",
    onMouseOut: "mouseout",
    onMouseEnter: "mouseenter",
    onMouseLeave: "mouseleave",
    onPinch: "pinch",
    onPinchStart: "pinchstart",
    onPinchEnd: "pinchend",
    onPan: "pan",
    onPanStart: "panstart",
    onPanEnd: "panend",
    onDrag: "drag",
    onDragStart: "dragstart",
    onDragEnter: "dragenter",
    onDragLeave: "dragleave",
    onDragOver: "dragover",
    onDragEnd: "dragend",
    onRightDown: "rightdown",
    onRightUp: "rightup",
    onRightUpOutside: "rightupoutside",
    onTouchStart: "touchstart",
    onTouchEnd: "touchend",
    onTouchEndOutside: "touchendoutside",
    onTouchMove: "touchmove",
    onTouchCancel: "touchcancel",
    onPress: "press",
    onPressUp: "pressup",
    onPressEnd: "pressend",
    onSwipe: "swipe",
    onDrop: "drop",
    onWeel: "wheel",
    onClick: "click",
    onDblClick: "dblclick"
}, exports.REACT_TO_CANOPUS_EVENTS_LIST = Object.keys(exports.REACT_TO_CANOPUS_EVENTS), 
exports.VArc = VArc, exports.VArc3d = VArc3d, exports.VArea = VArea, exports.VCircle = VCircle, 
exports.VGroup = VGroup, exports.VGlyph = VGlyph, exports.VImage = VImage, exports.VLine = VLine, 
exports.VPath = VPath, exports.VPolygon = VPolygon, exports.VPyramid3d = VPyramid3d, 
exports.VRect = VRect, exports.VRect3d = VRect3d, exports.VSymbol = VSymbol, exports.VText = VText, 
exports.VRichText = VRichText, VRichText.Text = function(params) {
    return Object.assign({
        type: "rich/text"
    }, params);
}, VRichText.Image = function(params) {
    return Object.assign({
        type: "rich/image"
    }, params);
};
//# sourceMappingURL=graphicType.js.map