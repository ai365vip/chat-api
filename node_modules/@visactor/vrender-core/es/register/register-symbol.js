import { createSymbol } from "../graphic/symbol";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerSymbolGraphic() {
    graphicCreator.RegisterGraphicCreator("symbol", createSymbol);
}
//# sourceMappingURL=register-symbol.js.map
