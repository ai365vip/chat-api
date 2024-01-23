import { Bounds, isValidNumber } from "@visactor/vutils";

function parseTemplate(template, total) {
    if (isValidNumber(template)) return template;
    const trimmedTemplate = template.trim();
    if ("auto" === trimmedTemplate) return 0;
    if (trimmedTemplate.endsWith("%")) {
        const percent = parseFloat(trimmedTemplate.substring(0, trimmedTemplate.length - 1));
        return isValidNumber(percent) ? percent * total : 0;
    }
    return 0;
}

function computeGrid(layout, width, height) {
    var _a, _b, _c, _d;
    const templateRows = null !== (_a = layout.gridTemplateRows) && void 0 !== _a ? _a : [ height ], templateColumns = null !== (_b = layout.gridTemplateColumns) && void 0 !== _b ? _b : [ width ], rowGap = null !== (_c = layout.gridRowGap) && void 0 !== _c ? _c : 0, columnGap = null !== (_d = layout.gridColumnGap) && void 0 !== _d ? _d : 0, rows = templateRows.map((row => parseTemplate(row, height))), columns = templateColumns.map((column => parseTemplate(column, width))), rowAuto = Math.max(0, rows.reduce(((left, row) => left - row), height) - rows.length * rowGap) / templateRows.filter((row => "auto" === row)).length, columnAuto = Math.max(0, columns.reduce(((left, column) => left - column), width) - columns.length * columnGap) / templateColumns.filter((column => "auto" === column)).length;
    let lastRow = 0;
    const accumulateRows = rows.map(((row, index) => {
        const finalRow = "auto" === templateRows[index] ? rowAuto : row, last = lastRow;
        return lastRow += finalRow + rowGap, last;
    }));
    accumulateRows.push(lastRow);
    let lastColumn = 0;
    const accumulateColumns = columns.map(((column, index) => {
        const finalColumn = "auto" === templateColumns[index] ? columnAuto : column, last = lastColumn;
        return lastColumn += finalColumn + columnGap, last;
    }));
    return accumulateColumns.push(lastColumn), {
        rows: accumulateRows,
        columns: accumulateColumns,
        rowGap: rowGap,
        columnGap: columnGap
    };
}

function normalizeIndex(index, count) {
    return Math.min(index < 0 ? index + count : index - 1, count);
}

function normalizeStartEndIndex(start, end, count) {
    let finalStart = normalizeIndex(start, count), finalEnd = normalizeIndex(end, count);
    if (isValidNumber(start) || isValidNumber(end) ? isValidNumber(start) ? isValidNumber(end) || (finalStart = normalizeIndex(Math.max(0, finalEnd - 1), count)) : finalEnd = normalizeIndex(finalStart + 1, count) : (finalStart = 1, 
    finalEnd = 2), finalStart > finalEnd) {
        const temp = finalEnd;
        finalEnd = finalStart, finalStart = temp;
    }
    return {
        start: finalStart,
        end: finalEnd
    };
}

function getCellBounds(grid, rowStart, rowEnd, columnStart, columnEnd) {
    const rowCount = grid.rows.length, columnCount = grid.columns.length, {start: finalRowStart, end: finalRowEnd} = normalizeStartEndIndex(rowStart, rowEnd, rowCount), {start: finalColumnStart, end: finalColumnEnd} = normalizeStartEndIndex(columnStart, columnEnd, columnCount), x1 = grid.columns[finalRowStart], x2 = grid.columns[finalRowEnd] - (finalColumnEnd === columnCount ? 0 : grid.columnGap), y1 = grid.rows[finalColumnStart], y2 = grid.rows[finalColumnEnd] - (finalRowEnd === rowCount ? 0 : grid.rowGap);
    return (new Bounds).set(x1, y1, x2, y2);
}

export const doGridLayout = (group, children, parentLayoutBounds, options) => {
    const grid = computeGrid(group.getSpec().layout, parentLayoutBounds.width(), parentLayoutBounds.height());
    children && children.forEach((mark => {
        const markLayout = mark.getSpec().layout;
        mark.layoutBounds = getCellBounds(grid, markLayout.gridRowStart, markLayout.gridRowEnd, markLayout.gridColumnStart, markLayout.gridColumnEnd), 
        mark.commit();
    }));
};
//# sourceMappingURL=grid.js.map
