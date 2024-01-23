"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const segmentation_1 = require("./segmentation"), wordle_1 = require("./wordle"), filling_1 = require("./filling");

function default_1(words, layoutConfig, segmentationOutput) {
    (0, segmentation_1.allocateWords)(words, segmentationOutput), "ensureMapping" === layoutConfig.layoutMode ? (0, 
    wordle_1.layoutGlobalShrink)(words, layoutConfig, segmentationOutput) : "ensureMappingEnlarge" === layoutConfig.layoutMode ? (0, 
    wordle_1.layoutSelfEnlarge)(words, layoutConfig, segmentationOutput) : (0, wordle_1.layout)(words, layoutConfig, segmentationOutput);
    const fillingWords = (0, filling_1.filling)(words, layoutConfig, segmentationOutput), failedWords = [], successedWords = [];
    for (let i = 0; i < words.length; i++) words[i].hasPlaced ? successedWords.push(words[i]) : failedWords.push(words[i]);
    return failedWords.forEach((word => word.visible = !1)), {
        fillingWords: fillingWords,
        successedWords: successedWords,
        failedWords: failedWords
    };
}

exports.default = default_1;