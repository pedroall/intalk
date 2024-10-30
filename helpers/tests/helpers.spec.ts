import { test, expect } from '@jest/globals'

import { parseId } from '@intalk/helpers'
import { ObjectId } from 'bson'

const oid = new ObjectId()
const oidString = oid.toString()

describe('Test parse id function', () => {
    test('Expect to throw an error', () => {
        expect(parseId('some text')).toThrowError()
    })
    test('Expect to return the same object id', () => {
        const testOid = parseId(oidString)
        expect(tesOid.toString()).toBe(oidString)
    })
})
