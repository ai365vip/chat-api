import { isNil } from "@visactor/vutils";

import { parseField } from "../../parse/util";

import { DefaultKey, DefaultGroupKeys } from "../constants";

export function groupData(data, key, sort) {
    const groupedData = new Map;
    if (!data || 0 === data.length) return {
        keys: [],
        data: groupedData
    };
    if (!key) return groupedData.set(DefaultKey, sort ? data.slice().sort(sort) : data.slice()), 
    {
        keys: DefaultGroupKeys,
        data: groupedData
    };
    const keyGetter = parseField(key);
    if (1 === data.length) {
        const key = keyGetter(data[0]);
        return groupedData.set(key, [ data[0] ]), {
            keys: [ key ],
            data: groupedData
        };
    }
    const keys = new Set;
    return data.forEach((entry => {
        var _a;
        const key = keyGetter(entry), lastData = null !== (_a = groupedData.get(key)) && void 0 !== _a ? _a : [];
        lastData.push(entry), groupedData.set(key, lastData), keys.add(key);
    })), sort && keys.forEach((key => {
        groupedData.get(key).sort(sort);
    })), {
        keys: Array.from(keys),
        data: groupedData
    };
}

export class Differ {
    constructor(data, key, sort) {
        this.prevData = (null == data ? void 0 : data.length) ? groupData(data, null != key ? key : null, sort) : null;
    }
    setCurrentData(currentData) {
        this.currentData = currentData;
    }
    getCurrentData() {
        return this.currentData;
    }
    doDiff() {
        if (this.callback) if (this.currentData && this.prevData) {
            const prevMap = new Map(this.prevData.data);
            this.currentData.keys.forEach((key => {
                this.callback(key, this.currentData.data.get(key), prevMap.get(key)), prevMap.delete(key);
            })), this.prevData.keys.forEach((key => {
                prevMap.has(key) && this.callback(key, null, prevMap.get(key));
            }));
        } else if (this.currentData) {
            this.currentData.keys.forEach((key => {
                this.callback(key, this.currentData.data.get(key), null);
            }));
        } else this.prevData && this.prevData.keys.forEach((key => {
            this.callback(key, null, this.prevData.data.get(key));
        }));
    }
    setCallback(callback) {
        this.callback = callback;
    }
    updateToCurrent() {
        this.prevData = this.currentData, this.currentData = null;
    }
    reset() {
        this.prevData = null;
    }
}

export function diffSingle(prev, next, key) {
    const result = {
        enter: [],
        exit: [],
        update: []
    }, differ = new Differ(prev, key);
    return differ.setCallback(((key, data, prevData) => {
        isNil(data) ? result.exit.push({
            prev: prevData[0]
        }) : isNil(prevData) ? result.enter.push({
            next: data[0]
        }) : result.update.push({
            next: data[0],
            prev: prevData[0]
        });
    })), differ.setCurrentData(groupData(next, key)), differ.doDiff(), result;
}

export function diffMultiple(prev, next, key) {
    const result = {
        enter: [],
        exit: [],
        update: []
    }, differ = new Differ(prev, key);
    return differ.setCallback(((key, data, prevData) => {
        isNil(data) ? result.exit.push({
            prev: prevData
        }) : isNil(prevData) ? result.enter.push({
            next: data
        }) : result.update.push({
            next: data,
            prev: prevData
        });
    })), differ.setCurrentData(groupData(next, key)), differ.doDiff(), result;
}
//# sourceMappingURL=differ.js.map
