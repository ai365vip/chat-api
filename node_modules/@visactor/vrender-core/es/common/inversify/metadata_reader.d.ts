import type { interfaces } from './interfaces';
declare class MetadataReader implements interfaces.MetadataReader {
    getConstructorMetadata(constructorFunc: NewableFunction): interfaces.ConstructorMetadata;
    getPropertiesMetadata(constructorFunc: NewableFunction): interfaces.MetadataMap;
}
export { MetadataReader };
