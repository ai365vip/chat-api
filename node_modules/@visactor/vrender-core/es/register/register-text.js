import { createText } from "../graphic/text";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerTextGraphic() {
    graphicCreator.RegisterGraphicCreator("text", createText);
}
//# sourceMappingURL=register-text.js.map
