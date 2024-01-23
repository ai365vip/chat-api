"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerSymbolGraphic = void 0;

const symbol_1 = require("../graphic/symbol"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerSymbolGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("symbol", symbol_1.createSymbol);
}

exports.registerSymbolGraphic = registerSymbolGraphic;
//# sourceMappingURL=register-symbol.js.map
