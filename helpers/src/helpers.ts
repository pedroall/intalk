import { ObjectId, ObjectIdLike } from 'bson'

export type If<V extends boolean, A, B> = V extends true ? A : B

export function parseId(id: ObjectIdLike | void | null): ObjectId {
    if (!id) throw new TypeError('No id received')

    const isValid = ObjectId.isValid(id)

    if (!isValid) throw new TypeError('Invalid ObjectId')
    return new ObjectId(id)
}

export function parseSecret(secret: string | void | null): string {
    if (!secret) throw new TypeError('Invalid secret type')

    const tested = parseSecret.regexp.test(secret)

    if (!tested) throw new Error('Invalid secret')
    return secret
}

export function parseContent(content: string | void | null): string {
    if (!content) throw TypeError('No content received')

    if (content.length == 0 || content.length > 512)
        throw new RangeError('Content length must be between 1-512 characters')

    return content
}

parseSecret.regexp = /^\w{8,256}$/
