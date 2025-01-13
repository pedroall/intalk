import Router from '@koa/router'
import { DatabaseManager, DatabaseError, UserErrorCodes } from '@intalk/models'
import { parseId, parseSecret } from '@intalk/helpers'

export class UserRouter extends Router {
    constructor(public db: DatabaseManager) {
        super()

        this.getUser()
        this.postUser()
        this.deleteUser()
    }

    getUser() {
        const User = this.db.User
        this.get('/users/:id', async (ctx) => {
            const id = ctx.params['id']

            try {
                parseId(id)
            } catch (error) {
                ctx.status = 412
                return
            }

            const user = new User({
                id,
            })

            try {
                const fetched = await user.fetch()

                if (fetched.deleted) {
                    ctx.status = 410
                    return
                }
                
                ctx.status = 200
                ctx.body = {
                    id: fetched.id,
                }
                return

            } catch (error) {
                if (error instanceof DatabaseError) {
                    if (error.code == UserErrorCodes.InvalidId) {
                        ctx.status = 412
                        return
                    }
                    if(error.code == UserErrorCodes.Deleted) {
                        ctx.status = 410
                        return
                    }

                    ctx.status = 500
                    return console.error(error)
                }

                return console.error(error)
            }
        })
    }

    postUser() {
        const User = this.db.User
        this.post('/users', async (ctx) => {
            const secretHeader = ctx.headers.authorization
            if (!secretHeader) {
                ctx.status = 401
                return
            }
            const secretHeaderSplit = secretHeader.split(' ')

            if (secretHeaderSplit.length < 2) {
                ctx.status = 401
                return
            }

            const authType = secretHeaderSplit.shift()
            const secret = secretHeaderSplit.shift()

            if (authType != 'Basic') {
                ctx.status = 401
                return
            }

            try {
                parseSecret(secret)
            } catch (_) {
                ctx.status = 401
                return
            }

            const user = new User({
                secret,
            })

            try {
                const newUser = await user.create()
                ctx.status = 201
                ctx.body = {
                    id: newUser.id,
                }
            } catch (error) {
                console.error(error)
                ctx.status = 500
                return
            }
        })
    }

    deleteUser() {
        const User = this.db.User

        this.delete('/users/:id', async (ctx) => {
            const id = ctx.params['id']

            try {
                parseId(id)
            } catch (_) {
                ctx.status = 406
                return
            }

            const secretHeader = ctx.headers.authorization
            if (!secretHeader) {
                ctx.status = 401
                return
            }
            const secretHeaderSplit = secretHeader.split(' ')
            if (secretHeaderSplit.length < 2) {
                ctx.status = 401
                return
            }

            const authType = secretHeaderSplit.shift()
            const secret = secretHeaderSplit.shift()

            if (authType != 'Basic') {
                ctx.status = 401
                return
            }

            const user = new User({
                id,
                secret,
            })

            try {
                const deletedUser = await user.delete()
                ctx.status = 204
                ctx.body = {
                    deleted: deletedUser.deleted,
                }
            } catch (error) {
                console.error(error)
                ctx.status = 500
                return
            }
        })
    }
}
