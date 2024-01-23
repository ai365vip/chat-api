import { allocateWords } from "./segmentation";

import { layout, layoutGlobalShrink, layoutSelfEnlarge } from "./wordle";

import { filling } from "./filling";

export default function(words, layoutConfig, segmentationOutput) {
    allocateWords(words, segmentationOutput), "ensureMapping" === layoutConfig.layoutMode ? layoutGlobalShrink(words, layoutConfig, segmentationOutput) : "ensureMappingEnlarge" === layoutConfig.layoutMode ? layoutSelfEnlarge(words, layoutConfig, segmentationOutput) : layout(words, layoutConfig, segmentationOutput);
    const fillingWords = filling(words, layoutConfig, segmentationOutput), failedWords = [], successedWords = [];
    for (let i = 0; i < words.length; i++) words[i].hasPlaced ? successedWords.push(words[i]) : failedWords.push(words[i]);
    return failedWords.forEach((word => word.visible = !1)), {
        fillingWords: fillingWords,
        successedWords: successedWords,
        failedWords: failedWords
    };
}