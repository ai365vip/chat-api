import { createLine } from "../graphic/line";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerLineGraphic() {
    graphicCreator.RegisterGraphicCreator("line", createLine);
}
//# sourceMappingURL=register-line.js.map
