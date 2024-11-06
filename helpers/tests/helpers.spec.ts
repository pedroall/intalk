import { test, expect, describe } from '@jest/globals'

import { parseId, parseSecret, parseContent, If } from '../dist/helpers.js'
import { ObjectId } from 'bson'
import { randomBytes } from 'node:crypto'

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

describe('Test parse secret function', () => {
    function validateSecret(secret: any): boolean {
        try {
            parseSecret(secret)
        } catch (_) {
            return false
        }
        return true
    }

    function validateSecretList(secretList: string[], expected: boolean) {
        for (const secret of secretList) {
            const isValid = validateSecret(secret)
            expect(isValid).toBe(expected)
        }
    }

    const validSecrets = ['helloWorld', 'myPassword123', 'test1234', 'fooBar12']

    const invalidSecrets = [
        'small',
        '@hahaiminvalid',
        '$',
        randomBytes(5000).toString('hex'),
    ]

    test('Test valid secrets', () => {
        validateSecretList(validSecrets, true)
    })
    test('Test invalid secrets', () => {
        validateSecretList(invalidSecrets, false)
    })
})

describe('Test parse content function', () => {
    test('Expect null content to not ne parsed', () => {
        function parseNullContent() {
            parseContent('')
        }

        expect(parseNullContent).toThrowError()
    })

    test('Expect big content to not be parsed', () => {
        function parseBigContent() {
            parseContent(randomBytes(5000).toString('hex'))
        }

        expect(parseBigContent).toThrowError()
    })

    test('Expect a normal content to be parsed', () => {
        parseContent('Hello World! My name is foo, what is yours? Ah, Bar! Hello Bar.')
    })
})

describe('Typescript tests', () => {
    test('Test if type', () => {
        type someType = If<true, string, null>

        const _name: someType = 'Hello'
    })
})
