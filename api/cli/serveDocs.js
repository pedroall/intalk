const Koa = require('koa')
const Router = require('@koa/router')
const fs = require('node:fs')
const path = require('node:path')

const marked = require('marked')

const defaultPort = Number(process.env['PORT']) || 3333

class DocsServer extends Koa {
    constructor() {
        super()
        this.router = new Router()
        this.loadRoutes()
        this.use(this.router.allowedMethods())
        this.use(this.router.middleware())
    }

    loadRoutes() {
        const docsDir = path.join(process.cwd(), 'docs')
        const docFiles = fs.readdirSync(docsDir)
        for(const docFile of docFiles) {
            const docPath = path.join(docsDir, docFile)
            const markdownContent = fs.readFileSync(docPath).toString()

            const html = marked.parse(markdownContent)

            const route = `/${docFile}`
            this.router.get(route, (ctx) => {
                ctx.body = html
            })
            console.log(`Loaded route ${route}`)
        }
    }
    start() {
        return new Promise((resolve, reject) => {
            try {
                const port = this.port || defaultPort
                this.listen(port, () => {
                    console.log(`Docs server running on port ${port}`)
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports.DocsServer = DocsServer
