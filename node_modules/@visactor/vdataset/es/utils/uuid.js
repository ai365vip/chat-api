let idIndex = 0;

const maxId = 1e8;

export function getUUID(prefix = "dataset") {
    return idIndex > maxId && (idIndex = 0), prefix + "_" + idIndex++;
}
//# sourceMappingURL=uuid.js.map