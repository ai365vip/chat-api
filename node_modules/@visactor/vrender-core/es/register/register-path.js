import { createPath } from "../graphic/path";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerPathGraphic() {
    graphicCreator.RegisterGraphicCreator("path", createPath);
}
//# sourceMappingURL=register-path.js.map
