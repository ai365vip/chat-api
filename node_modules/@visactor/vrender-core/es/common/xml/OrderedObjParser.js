import { getAllMatches } from "./utils";

class XmlNode {
    constructor(tagname) {
        this.tagname = tagname, this.child = [], this[":@"] = {};
    }
    add(key, val) {
        "__proto__" === key && (key = "#__proto__"), this.child.push({
            [key]: val
        });
    }
    addChild(node) {
        "__proto__" === node.tagname && (node.tagname = "#__proto__"), node[":@"] && Object.keys(node[":@"]).length > 0 ? this.child.push({
            [node.tagname]: node.child,
            ":@": node[":@"]
        }) : this.child.push({
            [node.tagname]: node.child
        });
    }
}

function findClosingIndex(xmlData, str, i, errMsg) {
    const closingIndex = xmlData.indexOf(str, i);
    if (-1 === closingIndex) throw new Error(errMsg);
    return closingIndex + str.length - 1;
}

function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
    let attrBoundary, tagExp = "";
    for (let index = i; index < xmlData.length; index++) {
        let ch = xmlData[index];
        if (attrBoundary) ch === attrBoundary && (attrBoundary = ""); else if ('"' === ch || "'" === ch) attrBoundary = ch; else if (ch === closingChar[0]) {
            if (!closingChar[1]) return {
                data: tagExp,
                index: index
            };
            if (xmlData[index + 1] === closingChar[1]) return {
                data: tagExp,
                index: index
            };
        } else "\t" === ch && (ch = " ");
        tagExp += ch;
    }
}

function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
    const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
    if (!result) return;
    let tagExp = result.data;
    const closeIndex = result.index, separatorIndex = tagExp.search(/\s/);
    let tagName = tagExp, attrExpPresent = !0;
    -1 !== separatorIndex && (tagName = tagExp.substr(0, separatorIndex).replace(/\s\s*$/, ""), 
    tagExp = tagExp.substr(separatorIndex + 1));
    const rawTagName = tagName;
    if (removeNSPrefix) {
        const colonIndex = tagName.indexOf(":");
        -1 !== colonIndex && (tagName = tagName.substr(colonIndex + 1), attrExpPresent = tagName !== result.data.substr(colonIndex + 1));
    }
    return {
        tagName: tagName,
        tagExp: tagExp,
        closeIndex: closeIndex,
        attrExpPresent: attrExpPresent,
        rawTagName: rawTagName
    };
}

const attrsRegx = new RegExp("([^\\s=]+)\\s*(=\\s*(['\"])([\\s\\S]*?)\\3)?", "gm");

export class OrderedObjParser {
    constructor(options) {
        this.currentNode = null, this.options = options, this.tagsNodeStack = [], this.docTypeEntities = {};
    }
    addChild(currentNode, childNode, jPath) {
        const result = childNode.tagname;
        "string" == typeof result ? (childNode.tagname = result, currentNode.addChild(childNode)) : currentNode.addChild(childNode);
    }
    buildAttributesMap(attrStr, jPath, tagName) {
        const attrs = {};
        if (!attrStr) return;
        const matches = getAllMatches(attrStr, attrsRegx), len = matches.length;
        for (let i = 0; i < len; i++) {
            const attrName = matches[i][1], oldVal = matches[i][4], aName = attrName;
            attrName && (attrs[aName] = void 0 === oldVal || (isNaN(oldVal) ? oldVal : Number(oldVal)));
        }
        return attrs;
    }
    parseXml(xmlData) {
        xmlData = xmlData.replace(/\r\n?/g, "\n");
        const xmlObj = new XmlNode("!xml");
        let currentNode = xmlObj, textData = "", jPath = "";
        for (let i = 0; i < xmlData.length; i++) {
            if ("<" === xmlData[i]) if ("/" === xmlData[i + 1]) {
                const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed."), propIndex = jPath.lastIndexOf(".");
                jPath = jPath.substring(0, propIndex), currentNode = this.tagsNodeStack.pop(), currentNode && currentNode.child && textData && currentNode.child[currentNode.child.length - 1][":@"] && (currentNode.child[currentNode.child.length - 1][":@"].text = textData), 
                textData = "", i = closeIndex;
            } else if ("?" === xmlData[i + 1]) {
                i = readTagExp(xmlData, i, !1, "?>").closeIndex + 1;
            } else if ("!--" === xmlData.substr(i + 1, 3)) {
                i = findClosingIndex(xmlData, "--\x3e", i + 4, "Comment is not closed.");
            } else {
                const result = readTagExp(xmlData, i, !1);
                let tagName = result.tagName, tagExp = result.tagExp;
                const attrExpPresent = result.attrExpPresent, closeIndex = result.closeIndex;
                if (tagName !== xmlObj.tagname && (jPath += jPath ? "." + tagName : tagName), tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
                    "/" === tagName[tagName.length - 1] ? (tagName = tagName.substr(0, tagName.length - 1), 
                    jPath = jPath.substr(0, jPath.length - 1), tagExp = tagName) : tagExp = tagExp.substr(0, tagExp.length - 1);
                    const childNode = new XmlNode(tagName);
                    tagName !== tagExp && attrExpPresent && (childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName)), 
                    this.addChild(currentNode, childNode, jPath), jPath = jPath.substr(0, jPath.lastIndexOf("."));
                } else {
                    const childNode = new XmlNode(tagName);
                    this.tagsNodeStack.push(currentNode), tagName !== tagExp && attrExpPresent && (childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName)), 
                    this.addChild(currentNode, childNode, jPath), currentNode = childNode;
                }
                textData = "", i = closeIndex;
            } else textData += xmlData[i];
        }
        return xmlObj.child;
    }
}
//# sourceMappingURL=OrderedObjParser.js.map
