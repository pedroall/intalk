#!/usr/bin/env node

const argv = process.argv
const APIServer = require('./serve').APIServer
const DocsServer = require('./serveDocs').DocsServer

argv.shift()
argv.shift()

async function main() {
    const command = argv.shift()

    switch(command) {
        case 'serve':
            const server = new APIServer()
            await server.start()

            break;
        case 'docs':
            const docsServer = new DocsServer()
            await docsServer.start()

            break;
        default:
            console.log('Unknown command!')
    }
}
main()
