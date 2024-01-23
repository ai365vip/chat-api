import { registerArea, registerLine, registerRect, registerSymbol } from "@visactor/vrender-kits";

import { loadTagComponent } from "../tag/register";

export function loadDataZoomComponent() {
    loadTagComponent(), registerRect(), registerSymbol(), registerArea(), registerLine();
}
//# sourceMappingURL=register.js.map