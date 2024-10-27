#!/usr/bin/env node

const { tsconfig, prettier, babel, jest } = require('./handler')

const command = process.argv[2]
const dir = process.argv[3]

switch(command) {
    case 'tsconfig':
        tsconfig(dir)
        break
    case 'prettier':
        prettier(dir)
        break
    case 'babel':
        babel(dir)
        break
    case 'jest':
        jest(dir)
        break
    default:
        console.log('Unknown command')
}
