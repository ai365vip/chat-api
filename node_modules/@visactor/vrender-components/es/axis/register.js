import { registerCircle, registerGroup, registerLine, registerPath, registerRect, registerRichtext, registerText } from "@visactor/vrender-kits";

function loadBasicAxis() {
    registerGroup(), registerLine(), registerRichtext(), registerText();
}

export function loadLineAxisComponent() {
    loadBasicAxis(), registerRect();
}

export function loadCircleAxisComponent() {
    loadBasicAxis(), registerCircle();
}

export function loadLineAxisGridComponent() {
    registerGroup(), registerPath();
}

export function loadCircleAxisGridComponent() {
    registerGroup(), registerPath();
}
//# sourceMappingURL=register.js.map