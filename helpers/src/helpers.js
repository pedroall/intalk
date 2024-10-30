import { ObjectId } from 'bson';
export function parseId(id) {
    if (!id)
        throw new TypeError('No id received');
    var isValid = ObjectId.isValid(id);
    if (!isValid)
        throw new TypeError('Invalid ObjectId');
    return ObjectId.createFromHexString(id);
}
export function parseSecret(secret) {
    if (!secret)
        throw new TypeError('Invalid secret type');
    var tested = parseSecret.regexp.test(secret);
    if (!tested)
        throw new Error('Invalid secret');
    return secret;
}
export function parseContent(content) {
    if (!content)
        throw TypeError('No content received');
    if (content.length == 0 || content.length > 512)
        throw new RangeError('Content length must be between 1-512 characters');
    return content;
}
parseSecret.regexp = /^\w{8,256}$/;
