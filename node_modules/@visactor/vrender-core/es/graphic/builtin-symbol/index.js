import circle from "./circle";

import cross from "./cross";

import diamond from "./diamond";

import square from "./square";

import triangle from "./triangle";

import star from "./star";

import arrow from "./arrow";

import wedge from "./wedge";

import stroke from "./stroke";

import wye from "./wye";

import triangleLeft from "./triangle-left";

import triangleRight from "./triangle-right";

import triangleUp from "./triangle-up";

import triangleDown from "./triangle-down";

import thinTriangle from "./thin-triangle";

import arrow2Left from "./arrow2-left";

import arrow2Right from "./arrow2-right";

import arrow2Up from "./arrow2-up";

import arrow2Down from "./arrow2-down";

import lineV from "./line-v";

import lineH from "./line-h";

import close from "./close";

import rect from "./rect";

export const builtinSymbols = [ circle, cross, diamond, square, thinTriangle, triangle, star, arrow, wedge, stroke, wye, triangleLeft, triangleRight, triangleUp, triangleDown, arrow2Left, arrow2Right, arrow2Up, arrow2Down, rect, lineV, lineH, close ];

export const builtinSymbolsMap = {};

builtinSymbols.forEach((symbol => {
    builtinSymbolsMap[symbol.type] = symbol;
}));

export const builtInSymbolStrMap = {
    arrowLeft: "M 0.25 -0.5 L -0.25 0 l 0.5 0.5",
    arrowRight: "M -0.25 -0.5 l 0.5 0.5 l -0.5 0.5",
    rectRound: "M 0.3 -0.5 C 0.41 -0.5 0.5 -0.41 0.5 -0.3 C 0.5 -0.3 0.5 0.3 0.5 0.3 C 0.5 0.41 0.41 0.5 0.3 0.5 C 0.3 0.5 -0.3 0.5 -0.3 0.5 C -0.41 0.5 -0.5 0.41 -0.5 0.3 C -0.5 0.3 -0.5 -0.3 -0.5 -0.3 C -0.5 -0.41 -0.41 -0.5 -0.3 -0.5 C -0.3 -0.5 0.3 -0.5 0.3 -0.5 Z",
    roundLine: "M 1.2392 -0.258 L -1.3432 -0.258 C -1.4784 -0.258 -1.588 -0.1436 -1.588 -0.002 c 0 0.1416 0.1096 0.256 0.2448 0.256 l 2.5824 0 c 0.1352 0 0.2448 -0.1144 0.2448 -0.256 C 1.484 -0.1436 1.3744 -0.258 1.2392 -0.258 z"
};

export * from "./utils";
//# sourceMappingURL=index.js.map
