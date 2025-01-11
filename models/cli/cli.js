#!/usr/bin/env node

const Ruxy = require('ruxy')
const args = process.argv

args.shift()
args.shift()

const command = args.shift()

async function main() {
    switch (command) {
        case 'startdb':
            const context = new Ruxy.Context([
                'mongod',
                '--dbpath',
                './db',
                '--fork',
                '--syslog',
            ])
            await context.run()
            console.log(context.stdout)
            console.log('Mongo database started.')
    }
}

main()
