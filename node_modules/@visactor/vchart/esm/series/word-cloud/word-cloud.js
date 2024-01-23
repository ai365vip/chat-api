import { SeriesTypeEnum } from "../interface/type";

import { BaseWordCloudSeries } from "./base";

import { Factory } from "../../core/factory";

import { registerWordCloudAnimation } from "./animation";

import { registerWordCloudTransforms } from "@visactor/vgrammar-wordcloud";

import { registerWordCloudShapeTransforms } from "@visactor/vgrammar-wordcloud-shape";

import { registerTextMark } from "../../mark/text";

export class WordCloudSeries extends BaseWordCloudSeries {
    constructor() {
        super(...arguments), this.type = SeriesTypeEnum.wordCloud;
    }
}

WordCloudSeries.type = SeriesTypeEnum.wordCloud;

export const registerWordCloudSeries = () => {
    registerWordCloudTransforms(), registerTextMark(), registerWordCloudAnimation(), 
    Factory.registerSeries(WordCloudSeries.type, WordCloudSeries);
};

export const registerWordCloudShapeSeries = () => {
    registerWordCloudShapeTransforms(), registerWordCloudTransforms(), registerTextMark(), 
    registerWordCloudAnimation(), Factory.registerSeries(WordCloudSeries.type, WordCloudSeries);
};
//# sourceMappingURL=word-cloud.js.map
