import { AbstractComponent } from "../core/base";

export class CrosshairBase extends AbstractComponent {
    constructor() {
        super(...arguments), this.name = "crosshair";
    }
    render() {
        this.renderCrosshair(this);
    }
}
//# sourceMappingURL=base.js.map