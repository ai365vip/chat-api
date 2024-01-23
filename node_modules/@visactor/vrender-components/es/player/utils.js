import { DirectionEnum } from "./type";

export const checkIndex = ({direction: direction, maxIndex: maxIndex, minIndex: minIndex, dataIndex: dataIndex}) => direction === DirectionEnum.Default ? dataIndex < maxIndex : direction === DirectionEnum.Reverse ? dataIndex > minIndex : void 0;

export const canPlay = ({direction: direction, maxIndex: maxIndex, minIndex: minIndex, dataIndex: dataIndex}) => checkIndex({
    direction: direction,
    maxIndex: maxIndex,
    minIndex: minIndex,
    dataIndex: dataIndex
});

export const isReachEndByDefault = ({direction: direction, maxIndex: maxIndex, dataIndex: dataIndex}) => direction === DirectionEnum.Default && dataIndex === maxIndex;

export const isReachEndByReverse = ({direction: direction, minIndex: minIndex, dataIndex: dataIndex}) => direction === DirectionEnum.Reverse && dataIndex === minIndex;

export const isReachEnd = ({direction: direction, maxIndex: maxIndex, minIndex: minIndex, dataIndex: dataIndex}) => isReachEndByDefault({
    direction: direction,
    maxIndex: maxIndex,
    dataIndex: dataIndex
}) || isReachEndByReverse({
    direction: direction,
    minIndex: minIndex,
    dataIndex: dataIndex
});

export const isReachStartByDefault = ({direction: direction, minIndex: minIndex, dataIndex: dataIndex}) => direction === DirectionEnum.Default && dataIndex === minIndex;

export const isReachStartByReverse = ({direction: direction, maxIndex: maxIndex, dataIndex: dataIndex}) => direction === DirectionEnum.Reverse && dataIndex === maxIndex;

export const isReachStart = ({direction: direction, maxIndex: maxIndex, minIndex: minIndex, dataIndex: dataIndex}) => isReachStartByDefault({
    direction: direction,
    minIndex: minIndex,
    dataIndex: dataIndex
}) || isReachStartByReverse({
    direction: direction,
    maxIndex: maxIndex,
    dataIndex: dataIndex
});

export const isVertical = orient => "left" === orient || "right" === orient;

export const isHorizontal = orient => "top" === orient || "bottom" === orient;

export const forwardStep = (direction, currentIndex, min, max) => "default" === direction ? Math.min(currentIndex + 1, max) : Math.max(currentIndex - 1, min);
//# sourceMappingURL=utils.js.map
