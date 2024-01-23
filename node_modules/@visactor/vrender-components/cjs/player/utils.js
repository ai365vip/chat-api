"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.forwardStep = exports.isHorizontal = exports.isVertical = exports.isReachStart = exports.isReachStartByReverse = exports.isReachStartByDefault = exports.isReachEnd = exports.isReachEndByReverse = exports.isReachEndByDefault = exports.canPlay = exports.checkIndex = void 0;

const type_1 = require("./type"), checkIndex = ({direction: direction, maxIndex: maxIndex, minIndex: minIndex, dataIndex: dataIndex}) => direction === type_1.DirectionEnum.Default ? dataIndex < maxIndex : direction === type_1.DirectionEnum.Reverse ? dataIndex > minIndex : void 0;

exports.checkIndex = checkIndex;

const canPlay = ({direction: direction, maxIndex: maxIndex, minIndex: minIndex, dataIndex: dataIndex}) => (0, 
exports.checkIndex)({
    direction: direction,
    maxIndex: maxIndex,
    minIndex: minIndex,
    dataIndex: dataIndex
});

exports.canPlay = canPlay;

const isReachEndByDefault = ({direction: direction, maxIndex: maxIndex, dataIndex: dataIndex}) => direction === type_1.DirectionEnum.Default && dataIndex === maxIndex;

exports.isReachEndByDefault = isReachEndByDefault;

const isReachEndByReverse = ({direction: direction, minIndex: minIndex, dataIndex: dataIndex}) => direction === type_1.DirectionEnum.Reverse && dataIndex === minIndex;

exports.isReachEndByReverse = isReachEndByReverse;

const isReachEnd = ({direction: direction, maxIndex: maxIndex, minIndex: minIndex, dataIndex: dataIndex}) => (0, 
exports.isReachEndByDefault)({
    direction: direction,
    maxIndex: maxIndex,
    dataIndex: dataIndex
}) || (0, exports.isReachEndByReverse)({
    direction: direction,
    minIndex: minIndex,
    dataIndex: dataIndex
});

exports.isReachEnd = isReachEnd;

const isReachStartByDefault = ({direction: direction, minIndex: minIndex, dataIndex: dataIndex}) => direction === type_1.DirectionEnum.Default && dataIndex === minIndex;

exports.isReachStartByDefault = isReachStartByDefault;

const isReachStartByReverse = ({direction: direction, maxIndex: maxIndex, dataIndex: dataIndex}) => direction === type_1.DirectionEnum.Reverse && dataIndex === maxIndex;

exports.isReachStartByReverse = isReachStartByReverse;

const isReachStart = ({direction: direction, maxIndex: maxIndex, minIndex: minIndex, dataIndex: dataIndex}) => (0, 
exports.isReachStartByDefault)({
    direction: direction,
    minIndex: minIndex,
    dataIndex: dataIndex
}) || (0, exports.isReachStartByReverse)({
    direction: direction,
    maxIndex: maxIndex,
    dataIndex: dataIndex
});

exports.isReachStart = isReachStart;

const isVertical = orient => "left" === orient || "right" === orient;

exports.isVertical = isVertical;

const isHorizontal = orient => "top" === orient || "bottom" === orient;

exports.isHorizontal = isHorizontal;

const forwardStep = (direction, currentIndex, min, max) => "default" === direction ? Math.min(currentIndex + 1, max) : Math.max(currentIndex - 1, min);

exports.forwardStep = forwardStep;
//# sourceMappingURL=utils.js.map
