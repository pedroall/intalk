import { ObjectId } from 'bson';
export type If<V extends boolean, A, B> = V extends true ? A : B;
export declare function parseId(id: any): ObjectId;
export declare function parseSecret(secret: any): any;
export declare namespace parseSecret {
    var regexp: RegExp;
}
export declare function parseContent(content: any): string;
