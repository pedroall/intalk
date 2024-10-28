const fs = require('fs')
const path = require('path')

const basePath = (dir = '.defaults') => path.join(process.cwd(), dir)
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
    copyFileToProject('prettier.config.js', 'base-prettier.config.js', dir)
    console.log('Created local prettier-base')
}

function babel(dir) {
    copyFileToProject('babel.config.js', 'base-babel.config.js', dir)
    console.log('Created local babel-base')
}

function jest(dir) {
    copyFileToProject('jest.config.js', 'base-jest.config.js', dir)
    console.log('Created local jest-base')
}

function help() {
    const txt = helpTxt()
    console.log(txt)
}

function helpTxt() {
    const txt = fs.readFileSync(
        path.join(__dirname, 'docs/help.txt')
    ).toString()

    return txt
}

module.exports = {
    tsconfig,
    prettier,
    babel,
    jest,
    help,

    readBaseFile,
    basePath,
    pathToWrite,
    helpTxt
}
