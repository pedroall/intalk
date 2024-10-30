import { test, expect, describe } from '@jest/globals'

import { parseId } from '../dist/helpers.js'
import { ObjectId } from 'bson'

const oid = new ObjectId()
const oidString = oid.toString()

describe('Test parse id function', () => {
    test('Expect to throw an error', () => {
        function parseInvalidId() {
            return parseId('some text')
        }
        expect(parseInvalidId).toThrowError()
    })
    test('Expect to return the same object id', () => {
        const testOid = parseId(oidString)
        expect(testOid.toString()).toBe(oidString)
    })
})
