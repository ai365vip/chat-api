import type { IElement } from '../../types/element';
import type { AttributeTransform, MarkType } from '../../types/mark';
export declare const transformsByType: Record<string, AttributeTransform[]>;
export declare function cloneTransformAttributes(markType: MarkType, attributes: any): any;
export declare const transformAttributes: (markType: MarkType | AttributeTransform[], nextAttrs: any, element: IElement, markName?: string) => {};
