import { createRect3d } from "../graphic/rect3d";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerRect3dGraphic() {
    graphicCreator.RegisterGraphicCreator("rect3d", createRect3d);
}
//# sourceMappingURL=register-rect3d.js.map
