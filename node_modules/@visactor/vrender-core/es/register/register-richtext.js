import { createRichText } from "../graphic/richtext";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerRichtextGraphic() {
    graphicCreator.RegisterGraphicCreator("richtext", createRichText);
}
//# sourceMappingURL=register-richtext.js.map
