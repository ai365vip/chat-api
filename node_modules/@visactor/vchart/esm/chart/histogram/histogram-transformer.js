import { setDefaultCrosshairForCartesianChart } from "../util";

import { BaseHistogramChartSpecTransformer } from "./base";

export class HistogramChartSpecTransformer extends BaseHistogramChartSpecTransformer {
    transformSpec(spec) {
        super.transformSpec(spec), setDefaultCrosshairForCartesianChart(spec);
    }
}
//# sourceMappingURL=histogram-transformer.js.map
