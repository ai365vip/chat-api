import { BaseChart } from "../../base";

import { BasePieChartSpecTransformer } from "./pie-transformer";

export class BasePieChart extends BaseChart {
    constructor() {
        super(...arguments), this.transformerConstructor = BasePieChartSpecTransformer;
    }
}

BasePieChart.transformerConstructor = BasePieChartSpecTransformer;
//# sourceMappingURL=base.js.map
