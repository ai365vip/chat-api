import { createArea } from "../graphic/area";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerAreaGraphic() {
    graphicCreator.RegisterGraphicCreator("area", createArea);
}
//# sourceMappingURL=register-area.js.map
