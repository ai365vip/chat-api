import { isValid, isValidNumber, maxInArray, minInArray } from "@visactor/vutils";

const computeInteractionPoint = (xIndex, yIndex, cell, cellRow, cellColumn, threshold) => {
    const thresholdCell = [ cell[0] >= threshold ? 1 : 0, cell[1] >= threshold ? 1 : 0, cell[2] >= threshold ? 1 : 0, cell[3] >= threshold ? 1 : 0 ], points = [];
    thresholdCell[0] !== thresholdCell[1] && points.push({
        id: `${xIndex}-${yIndex - 1}-${xIndex}-${yIndex}`,
        currentCell: yIndex * cellColumn + xIndex,
        nextCell: (yIndex - 1) * cellColumn + xIndex,
        point: {
            x: xIndex + (threshold - cell[0]) / (cell[1] - cell[0]),
            y: yIndex
        },
        siblingPoint: null
    }), thresholdCell[1] !== thresholdCell[2] && points.push({
        id: `${xIndex}-${yIndex}-${xIndex + 1}-${yIndex}`,
        currentCell: yIndex * cellColumn + xIndex,
        nextCell: yIndex * cellColumn + xIndex + 1,
        point: {
            x: xIndex + 1,
            y: yIndex + (threshold - cell[1]) / (cell[2] - cell[1])
        },
        siblingPoint: null
    }), thresholdCell[2] !== thresholdCell[3] && points.push({
        id: `${xIndex}-${yIndex}-${xIndex}-${yIndex + 1}`,
        currentCell: yIndex * cellColumn + xIndex,
        nextCell: (yIndex + 1) * cellColumn + xIndex,
        point: {
            x: xIndex + (threshold - cell[3]) / (cell[2] - cell[3]),
            y: yIndex + 1
        },
        siblingPoint: null
    }), thresholdCell[3] !== thresholdCell[0] && points.push({
        id: `${xIndex - 1}-${yIndex}-${xIndex}-${yIndex}`,
        currentCell: yIndex * cellColumn + xIndex,
        nextCell: yIndex * cellColumn + xIndex - 1,
        point: {
            x: xIndex,
            y: yIndex + (threshold - cell[0]) / (cell[3] - cell[0])
        },
        siblingPoint: null
    });
    const thresholdFlag = (8 & thresholdCell[0]) + (4 & thresholdCell[1]) + (2 & thresholdCell[2]) + (1 & thresholdCell[3]);
    return 6 === thresholdFlag || 9 === thresholdFlag ? (points[0].siblingPoint = points[1], 
    points[1].siblingPoint = points[0], points[2].siblingPoint = points[3], points[3].siblingPoint = points[2]) : 2 === points.length && (points[0].siblingPoint = points[1], 
    points[1].siblingPoint = points[0]), points;
}, connectPoints = (point, grid) => {
    const siblingPoint = point.siblingPoint, connectResult = connectNextPoints(point, grid);
    if ("loop" === connectResult.result) return connectResult.points;
    return connectNextPoints(siblingPoint, grid).points.reverse().concat(connectResult.points);
}, connectNextPoints = (point, grid) => {
    const connectedPoints = [ point ];
    let currentPoint = point;
    const find = p => p.id === currentPoint.id;
    let result = "break";
    do {
        const nextCell = grid[currentPoint.nextCell], nextCellPoint = null == nextCell ? void 0 : nextCell.find(find);
        if (nextCellPoint) {
            if (currentPoint = nextCellPoint.siblingPoint, connectedPoints.includes(currentPoint)) {
                result = "loop", connectedPoints.push(currentPoint);
                break;
            }
            if (!currentPoint) break;
            connectedPoints.push(currentPoint);
        } else currentPoint = null;
    } while (currentPoint);
    return {
        points: connectedPoints,
        result: result
    };
};

export const transform = (options, upstreamData) => {
    var _a;
    if (!upstreamData || 0 === upstreamData.length) return upstreamData;
    const row = options.row, column = options.column, cellRow = row - 1, cellColumn = column - 1, data = upstreamData.map((datum => datum[options.field])), extent = [ minInArray(data), maxInArray(data) ], thresholds = null !== (_a = options.thresholds) && void 0 !== _a ? _a : [];
    if (!isValid(options.thresholds) && isValidNumber(options.levels)) {
        const step = (extent[1] - extent[0]) / options.levels;
        for (let i = 1; i < options.levels; i++) thresholds.push(extent[0] + i * step);
    }
    const cells = [];
    for (let yIndex = 1; yIndex < row; yIndex++) for (let xIndex = 1; xIndex < column; xIndex++) {
        const topLeft = data[(yIndex - 1) * column + xIndex - 1], topRight = data[(yIndex - 1) * column + xIndex], bottomRight = data[yIndex * column + xIndex], bottomLeft = data[yIndex * column + xIndex - 1];
        cells.push([ topLeft, topRight, bottomRight, bottomLeft ]);
    }
    const contours = [];
    return thresholds.forEach((threshold => {
        var _a, _b;
        const points = [], gridPoints = [];
        for (let yIndex = 0; yIndex < cellRow; yIndex++) for (let xIndex = 0; xIndex < cellColumn; xIndex++) {
            const cell = cells[yIndex * cellColumn + xIndex], gridPoint = computeInteractionPoint(xIndex, yIndex, cell, 0, cellColumn, threshold);
            points.push(...gridPoint), gridPoints.push(gridPoint);
        }
        let processingPoints = points.slice();
        do {
            const connectedPoints = connectPoints(processingPoints[0], gridPoints);
            if (processingPoints.splice(0, 1), connectedPoints.length) {
                const connectedPointIds = connectedPoints.map((point => point.id));
                processingPoints = processingPoints.filter((point => !connectedPointIds.includes(point.id)));
                const contour = {
                    [null !== (_a = options.asThreshold) && void 0 !== _a ? _a : "threshold"]: threshold,
                    [null !== (_b = options.asPoints) && void 0 !== _b ? _b : "points"]: connectedPoints.map((point => ({
                        x: point.point.x / row,
                        y: point.point.y / column
                    })))
                };
                contours.push(contour);
            }
        } while (processingPoints.length > 0);
    })), contours;
};
//# sourceMappingURL=contour.js.map
