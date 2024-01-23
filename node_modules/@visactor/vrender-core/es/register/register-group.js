import { createGroup } from "../graphic/group";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerGroupGraphic() {
    graphicCreator.RegisterGraphicCreator("group", createGroup);
}
//# sourceMappingURL=register-group.js.map
