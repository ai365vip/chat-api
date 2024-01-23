import { createPyramid3d } from "../graphic/pyramid3d";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerPyramid3dGraphic() {
    graphicCreator.RegisterGraphicCreator("pyramid3d", createPyramid3d);
}
//# sourceMappingURL=register-pyramid3d.js.map
