import { createShadowRoot } from "../graphic/shadow-root";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerShadowRootGraphic() {
    graphicCreator.RegisterGraphicCreator("shadowRoot", createShadowRoot);
}
//# sourceMappingURL=register-shadowRoot.js.map
