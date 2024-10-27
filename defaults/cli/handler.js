const fs = require('fs')
const path = require('path')

const basePath = (dir = 'defaults') => path.join(process.cwd(), dir)
const pathToWrite = (file, dir = basePath()) => path.join(dir, file)

const filesPath = path.join(path.resolve(__dirname, '../files'))

function readBaseFile(baseFile) {
    return fs.readFileSync(path.join(filesPath, baseFile))
}

function copyFileToProject(baseFile, newFile, dir) {
    const defaultsPath = basePath(dir)
    if(!fs.existsSync(defaultsPath))
        fs.mkdirSync(defaultsPath)
    else if(!fs.statSync(defaultsPath).isDirectory()) {
        throw new Error(`path ${defaultsPath} already has a defaults file and it's not a directory!`)
    }
    const data = readBaseFile(baseFile)

    fs.writeFileSync(pathToWrite(newFile, defaultsPath), data)
}

function tsconfig(dir) {
    copyFileToProject('tsconfig.json', 'base-tsconfig.json', dir)
    console.log('Created local tsconfig-base')
}

function prettier(dir) {
    copyFileToProject('prettier.config.js', 'prettier-base.config.js', dir)
    console.log('Created local prettier-base')
}

function babel(dir) {
    copyFileToProject('babel.config.js', 'babel-base.config.js', dir)
    console.log('Created local babel-base')
}

function jest(dir) {
    copyFileToProject('jest.config.js', 'jest-base.config.js', dir)
    console.log('Created local jest-base')
}

module.exports = {
    tsconfig,
    prettier,
    babel,
    jest,

    readBaseFile,
    basePath,
    pathToWrite
}
