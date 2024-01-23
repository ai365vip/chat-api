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

import { error } from "./debug";

export function URLToImage(name = "vchart", url) {
    const link = document.createElement("a");
    link.setAttribute("href", url), link.setAttribute("target", "_blank"), link.setAttribute("download", `${name}.png`), 
    link.dispatchEvent(new MouseEvent("click"));
}

export function OffscreenCanvasToDataURL(c) {
    return new Promise((r => {
        c.convertToBlob().then((b => {
            const reader = new FileReader;
            reader.readAsDataURL(b), reader.onload = () => {
                r(reader.result);
            };
        }));
    }));
}

export function getCanvasDataURL(c, ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, (function*() {
        if (!c) return "";
        try {
            if (void 0 !== OffscreenCanvas && c instanceof OffscreenCanvas) return OffscreenCanvasToDataURL(c);
        } catch (_error) {
            (null !== (_a = null == ctx ? void 0 : ctx.onError) && void 0 !== _a ? _a : error)(`getCanvasDataURL error : ${_error.toString()}`);
        }
        return c.toDataURL();
    }));
}
//# sourceMappingURL=image.js.map
