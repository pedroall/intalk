import { test, expect } from '@jest/globals'
import { Context } from 'ruxy'

import crypto from 'node:crypto'
import fs from 'node:fs'

import { readBaseFile, pathToWrite, basePath, helpTxt } from '../cli/handler'
import path from 'path'

const cliPath = path.resolve(__dirname, '../cli/')
const script = path.join(cliPath, 'cli.js')

const testDefaults = '.test-defaults'

const ENDL = '\n'

function createCheckSum(content: string) {
    return crypto.createHash('md5').update(content).digest('hex')
}

function fileIsEqual(baseFile: string, newFile: string) {
    const baseFileContent = readBaseFile(baseFile)
    const newFileContent = fs.readFileSync(pathToWrite(newFile, basePath(testDefaults))).toString()

    const baseFileSum = createCheckSum(baseFileContent)
    const newFileSum = createCheckSum(newFileContent)

    return baseFileSum == newFileSum
}

async function ensureFileCreation(command: string, baseFile: string, newFile: string) {
    const ctx = new Context(['node', script, command, testDefaults])
    await ctx.run()
    return fileIsEqual(baseFile, newFile)
}

test('Test if tsconfig base works', async() => {
    const result = await ensureFileCreation('tsconfig', 'tsconfig.json', 'base-tsconfig.json')
    expect(result).toBeTruthy()
})

test('Test if prettier base works', async() => {
    const result = await ensureFileCreation('prettier', 'prettier.config.js', 'base-prettier.config.js')
    expect(result).toBeTruthy()
})

test('Test if babel base works', async () => {
    const result = await ensureFileCreation('babel', 'babel.config.js', 'base-babel.config.js')
    expect(result).toBeTruthy()
})

test('Test if jest base works', async() => {
    const result = await ensureFileCreation('jest', 'jest.config.js', 'base-jest.config.js')
    expect(result).toBeTruthy()
})

test('Test help command', async() => {
    const txt = helpTxt()
    const ctx = new Context(['node', script, 'help'])
        await ctx.run()

    expect(ctx.stdout).toBe(txt + ENDL)
})
