import { test } from '@jest/globals'
import { Context } from 'ruxy'

import crypto from 'node:crypto'
import fs from 'node:fs'

import { readBaseFile, pathToWrite, basePath } from '../cli/handle'

import path from 'path'

const cliPath = path.resolve(__dirname, '../cli/cli.js')

const testDefaults = 'test-defaults'

function createCheckSum(content: string) {
    return crypto.createHash('md5').update(content).digest('hex')
}

function fileIsEqual(baseFile: string, newFile: string) {
    const baseFileContent = readBaseFile(baseFile)
    const newFileContent = fs.readFileSync(pathToWrite(newFile, basePath(testDefaults)))

    const baseFileSum = createCheckSum(baseFileContent)
    const newFileSum = createCheckSum(newFileContent)

    return baseFileSum == newFileSum
}

test('Test if tsconfig base works', async() => {
    const ctx = new Context('node', cliPath, 'tsconfig', testDefaults)
        .run()
})
