import { Hook } from "./Hook";

export class SyncHook extends Hook {
    call(...args) {
        this.taps.map((t => t.fn)).forEach((cb => cb(...args)));
    }
}
//# sourceMappingURL=SyncHook.js.map
