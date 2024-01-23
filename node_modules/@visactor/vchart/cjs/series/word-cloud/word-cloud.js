"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerWordCloudShapeSeries = exports.registerWordCloudSeries = exports.WordCloudSeries = void 0;

const type_1 = require("../interface/type"), base_1 = require("./base"), factory_1 = require("../../core/factory"), animation_1 = require("./animation"), vgrammar_wordcloud_1 = require("@visactor/vgrammar-wordcloud"), vgrammar_wordcloud_shape_1 = require("@visactor/vgrammar-wordcloud-shape"), text_1 = require("../../mark/text");

class WordCloudSeries extends base_1.BaseWordCloudSeries {
    constructor() {
        super(...arguments), this.type = type_1.SeriesTypeEnum.wordCloud;
    }
}

exports.WordCloudSeries = WordCloudSeries, WordCloudSeries.type = type_1.SeriesTypeEnum.wordCloud;

const registerWordCloudSeries = () => {
    (0, vgrammar_wordcloud_1.registerWordCloudTransforms)(), (0, text_1.registerTextMark)(), 
    (0, animation_1.registerWordCloudAnimation)(), factory_1.Factory.registerSeries(WordCloudSeries.type, WordCloudSeries);
};

exports.registerWordCloudSeries = registerWordCloudSeries;

const registerWordCloudShapeSeries = () => {
    (0, vgrammar_wordcloud_shape_1.registerWordCloudShapeTransforms)(), (0, exports.registerWordCloudSeries)();
};

exports.registerWordCloudShapeSeries = registerWordCloudShapeSeries;
//# sourceMappingURL=word-cloud.js.map
