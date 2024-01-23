var __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))((function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            var value;
            result.done ? resolve(result.value) : (value = result.value, value instanceof P ? value : new P((function(resolve) {
                resolve(value);
            }))).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    }));
};

import { application } from "../application";

import { isXML } from "../common/xml/parser";

import { isArray } from "@visactor/vutils";

import { XMLParser } from "../common/xml";

export function incrementalAddTo(group, graphic) {
    group.incrementalAppendChild(graphic);
}

export function waitForAllSubLayers(stage) {
    return __awaiter(this, void 0, void 0, (function*() {
        const promiseList = [], layers = stage.getChildren();
        yield new Promise((resolve => {
            application.global.getRequestAnimationFrame()((() => {
                resolve(null);
            }));
        })), layers.forEach((l => {
            l.subLayers.size && l.subLayers.forEach((sl => {
                sl.drawContribution && sl.drawContribution.hooks && sl.drawContribution.rendering && promiseList.push(new Promise((resolve => {
                    sl.drawContribution.hooks.completeDraw.tap("outWait", (() => {
                        sl.drawContribution.hooks.completeDraw.taps = sl.drawContribution.hooks.completeDraw.taps.filter((i => "outWait" !== i.name)), 
                        resolve(null);
                    }));
                })));
            }));
        })), yield Promise.all(promiseList);
    }));
}

export function boundStroke(bounds, halfW, miter, pad = 0) {
    return bounds.expand(halfW + (pad / 2 + (miter ? miterAdjustment(miter, halfW) : 0))), 
    bounds;
}

function miterAdjustment(miter, strokeWidth) {
    return miter ? strokeWidth : 0;
}

let NUMBER_TYPE = 0;

export function genNumberType() {
    return NUMBER_TYPE++;
}

export var TextDirection;

!function(TextDirection) {
    TextDirection[TextDirection.HORIZONTAL = 0] = "HORIZONTAL", TextDirection[TextDirection.VERTICAL = 1] = "VERTICAL";
}(TextDirection || (TextDirection = {}));

export function verticalLayout(text) {
    const nextCharacter = [];
    let flag = 0, currStr = "";
    for (let i = 0; i < text.length; i++) rotateText(text[i]) ? flag ? currStr += text[i] : (flag = 1, 
    currStr = text[i]) : (flag && (nextCharacter.push({
        text: currStr,
        direction: TextDirection.VERTICAL
    }), currStr = "", flag = 0), nextCharacter.push({
        text: text[i],
        direction: TextDirection.HORIZONTAL
    }));
    return currStr && nextCharacter.push({
        text: currStr,
        direction: TextDirection.VERTICAL
    }), nextCharacter;
}

const rotateCharList = [ "…", "（", "）", "—", "【", "】", "「", "」", "《", "》" ], rotateCharMap = new Map;

rotateCharList.forEach((c => rotateCharMap.set(c, !0)));

const noRotateCharList = [ "" ], noRotateCharMap = new Map;

function rotateText(c) {
    if (rotateCharMap.has(c)) return !0;
    if (noRotateCharMap.has(c)) return !1;
    let rotate = !1;
    return c.codePointAt(0) < 256 && (rotate = !0), rotate;
}

noRotateCharList.forEach((c => noRotateCharMap.set(c, !0)));

export function xul(str) {
    const xmlStr = isArray(str) ? str[0] : str, config = [];
    if (!xmlStr) return config;
    if (!0 === isXML(xmlStr)) {
        const data = (new XMLParser).parse(xmlStr);
        data.tc && Object.keys(data.tc).forEach((k => {
            "text" === k ? config.push(parseRTTextXML(data.tc[k])) : config.push(parseRTImageXML(data.tc[k]));
        }));
    }
    return config;
}

function parseRTTextXML(str) {
    const output = {
        text: ""
    };
    parseCommonXML(str, output);
    const inlineText = str["#text"];
    return inlineText && (output.text = inlineText), output;
}

function parseCommonXML(str, output) {
    const attr = str.attribute;
    if (attr) {
        attr.split(";").forEach((attrItem => {
            if (!attrItem) return;
            const kv = attrItem.split(":");
            if (2 === kv.length) {
                const val = parseFloat(kv[1]);
                output[kv[0].trim()] = isFinite(val) ? val : kv[1].trim();
            } else {
                let val = "";
                for (let i = 1; i < kv.length; i++) i > 1 && (val += ":"), val += kv[i].trim();
                output[kv[0].trim()] = val;
            }
        }));
    }
}

function parseRTImageXML(str) {
    const output = {
        image: "",
        width: 0,
        height: 0
    };
    parseCommonXML(str, output);
    const image = output.image;
    return image && (output.image = image.replaceAll("&quot", '"').replaceAll("&lt", "<").replaceAll("&gt", ">")), 
    output;
}
//# sourceMappingURL=tools.js.map
