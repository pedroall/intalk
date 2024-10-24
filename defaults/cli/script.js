#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function tsconfig() {
    const basePath = process.cwd()
    const filesPath = path.join(path.resolve(__dirname, '../files'))

    const tsConfigJson = fs.readFileSync(path.join(filesPath, 'tsconfig.json'))

    fs.writeFileSync(path.join(basePath, 'base-tsconfig.json'), tsConfigJson)
}
const command = process.argv[2]

switch(command) {
    case 'tsconfig':
        tsconfig()
        break
    default:
        console.log('Unknown command')
}
