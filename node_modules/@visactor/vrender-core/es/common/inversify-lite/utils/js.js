export function getFirstArrayDuplicate(array) {
    const seenValues = new Set;
    for (const entry of array) {
        if (seenValues.has(entry)) return entry;
        seenValues.add(entry);
    }
}
//# sourceMappingURL=js.js.map
