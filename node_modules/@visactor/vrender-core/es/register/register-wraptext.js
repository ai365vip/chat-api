import { createWrapText } from "../graphic/wrap-text";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerWrapTextGraphic() {
    graphicCreator.RegisterGraphicCreator("wrapText", createWrapText);
}
//# sourceMappingURL=register-wraptext.js.map
