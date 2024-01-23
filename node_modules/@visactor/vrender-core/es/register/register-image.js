import { createImage } from "../graphic/image";

import { graphicCreator } from "../graphic/graphic-creator";

export function registerImageGraphic() {
    graphicCreator.RegisterGraphicCreator("image", createImage);
}
//# sourceMappingURL=register-image.js.map
