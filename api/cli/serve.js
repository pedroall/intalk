require('dotenv/config')

const Koa = require('koa')

const API = require('../dist/api')
const mongoose = require('mongoose')
const DatabaseManager = require('@intalk/models').DatabaseManager

class APIServer extends Koa {
    constructor(config = {}) {
        super()

        this.port = config.port instanceof Number ? config.port : 3000
    }

    async start() {
        const mongo = await mongoose.connect(process.env['DATABASE_URL'])
        const db = new DatabaseManager(mongo)
        const router = new API.APIRouter(db)

        this.use(router.routes())
        this.use(router.allowedMethods())

        this.listen(this.port)
    }
}

module.exports.APIServer = APIServer
