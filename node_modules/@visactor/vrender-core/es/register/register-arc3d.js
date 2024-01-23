import { createArc3d } from "../graphic/arc3d";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerArc3dGraphic() {
    graphicCreator.RegisterGraphicCreator("arc3d", createArc3d);
}
//# sourceMappingURL=register-arc3d.js.map
