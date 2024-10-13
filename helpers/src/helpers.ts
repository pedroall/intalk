import { ObjectId, ObjectIdLike } from 'bson'

export type If<
    Value extends boolean,
    TrueResult,
    FalseResult = null
> = Value extends true
    ? TrueResult
    : Value extends false
    ? FalseResult
    : TrueResult | FalseResult

export function parseId(id: ObjectIdLike | void | null): ObjectId {
    if (!id) throw new Error('No id received')

    const isValid = ObjectId.isValid(id)

    if (!isValid) throw new Error('Invalid ObjectId')
    return new ObjectId('id')
}

export function parseSecret(secret: string | void | null): string {
    if (!secret) throw new TypeError('Invalid secret type')

    const tested = parseSecret.regexp.test(secret)

    if (!tested) throw new Error('Invalid secret')
    return secret
}

parseSecret.regexp = /^\w{8,256}$/
