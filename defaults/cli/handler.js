const fs = require('fs')
const path = require('path')

const basePath = (dir = '.defaults') => path.join(process.cwd(), dir)
const pathToWrite = (file, dir = basePath()) => path.join(dir, file)

const filesPath = path.join(path.resolve(__dirname, '../files'))

const FileNames = {
    tsconfig: 'base-tsconfig.json',
    prettier: 'base-prettier.config.js',
    babel: 'base-babel.config.js',
    jest: 'base-jest.config.js'
}

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
    copyFileToProject('tsconfig.json', FileNames.tsconfig, dir)
    console.log('Created local tsconfig-base')
}

function prettier(dir) {
    copyFileToProject('prettier.config.js', FileNames.prettier, dir)
    console.log('Created local prettier-base')
}

function babel(dir) {
    copyFileToProject('babel.config.js', FileNames.babel, dir)
    console.log('Created local babel-base')
}

function jest(dir) {
    copyFileToProject('jest.config.js', FileNames.jest, dir)
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

function update() {
    const currentFiles = fs.readdirSync(basePath())

    if(!currentFiles.length)
        return console.log('Nothing to update')

    for(file of currentFiles) {
        switch(file) {
            case FileNames.tsconfig:
                tsconfig()
                break
               case FileNames.prettier:
                prettier()
                break
            case FileNames.babel:
                babel()
                break
            case FileNames.jest:
                jest()
                break
            default:
                throw new Error(`Unknown file ${file} in ${basePath()} dir`)
        }
    }
}

module.exports = {
    tsconfig,
    prettier,
    babel,
    jest,
    help,
    update,

    readBaseFile,
    basePath,
    pathToWrite,
    helpTxt
}
