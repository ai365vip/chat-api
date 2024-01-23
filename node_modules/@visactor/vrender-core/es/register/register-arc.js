import { createArc } from "../graphic/arc";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerArcGraphic() {
    graphicCreator.RegisterGraphicCreator("arc", createArc);
}
//# sourceMappingURL=register-arc.js.map
