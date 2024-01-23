export function prettify(node, options) {
    return compress(node);
}

function compress(arr, jPath) {
    const compressedObj = {};
    for (let i = 0; i < arr.length; i++) {
        const tagObj = arr[i], property = propName(tagObj);
        let newJpath = "";
        if (newJpath = void 0 === jPath ? property : jPath + "." + property, void 0 !== property && tagObj[property]) {
            const val = compress(tagObj[property], newJpath);
            isLeafTag(val);
            tagObj[":@"] && assignAttributes(val, tagObj[":@"], newJpath), void 0 !== compressedObj[property] && compressedObj.hasOwnProperty(property) ? (Array.isArray(compressedObj[property]) || (compressedObj[property] = [ compressedObj[property] ]), 
            compressedObj[property].push(val)) : compressedObj[property] = val;
        }
    }
    return compressedObj;
}

function propName(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (":@" !== key) return key;
    }
}

function assignAttributes(obj, attrMap, jpath) {
    if (attrMap) {
        const keys = Object.keys(attrMap), len = keys.length;
        for (let i = 0; i < len; i++) {
            const atrrName = keys[i];
            obj[atrrName] = attrMap[atrrName];
        }
    }
}

function isLeafTag(obj) {
    return 0 === Object.keys(obj).length;
}
//# sourceMappingURL=node2json.js.map
