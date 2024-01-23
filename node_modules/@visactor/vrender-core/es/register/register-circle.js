import { createCircle } from "../graphic/circle";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerCircleGraphic() {
    graphicCreator.RegisterGraphicCreator("circle", createCircle);
}
//# sourceMappingURL=register-circle.js.map
