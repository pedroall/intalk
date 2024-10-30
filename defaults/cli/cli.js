#!/usr/bin/env node

const { tsconfig, prettier, babel, jest, help, update } = require('./handler')

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
    case 'help':
        help()
        break
    case 'update':
        update()
        break
    default:
        help()
}
