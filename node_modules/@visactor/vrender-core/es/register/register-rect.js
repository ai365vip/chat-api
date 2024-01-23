import { createRect } from "../graphic/rect";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerRectGraphic() {
    graphicCreator.RegisterGraphicCreator("rect", createRect);
}
//# sourceMappingURL=register-rect.js.map
