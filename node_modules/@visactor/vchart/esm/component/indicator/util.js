import { array } from "@visactor/vutils";

export const indicatorMapper = (data, op) => {
    const {datum: datum, title: title, content: content} = op, mappedData = [], datumResult = datum.call(null);
    return title.visible && mappedData.push({
        type: "title",
        index: 0,
        datum: datumResult,
        spec: title
    }), array(content).forEach(((c, i) => {
        c.visible && mappedData.push({
            type: "content",
            index: i,
            datum: datumResult,
            spec: c
        });
    })), mappedData;
};
//# sourceMappingURL=util.js.map
