import Router from '@koa/router'
import { DatabaseManager, DatabaseError, UserErrorCodes } from '@intalk/models'
import { parseId, parseSecret } from '@intalk/helpers'

type authTypes = 'Basic'
const parseAuthType: (value: any) => authTypes = (value: string) => {
    if(typeof value != 'string') {
        throw new Error('AuthType must be an string.')
    }
    if(value != 'Basic') {
        throw new Error('Onlt Basic authorization type is allowrd.')
    }

    return value as authTypes
}
const parseAuthorizationHeader: (rawHeader?: string | string[]) => [authTypes, string] = (rawHeader?: string | string[]) => {
    if(!rawHeader)
        throw new Error('No Authorization provided.')
    const split = Array.isArray(rawHeader) ? rawHeader : rawHeader.split(' ')
    if(split.length != 2) {
        throw new Error('Authorization header must contain only two fields: authType, secret.')
    }

    const authType: authTypes = parseAuthType(split.shift())
    const secret = split.shift()

    if(!secret) {
        throw new Error('No secret provided.')
    }

    parseSecret(secret)

    return [authType, secret]
}

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
            const authorizationHeader = ctx.headers.authorization

            let  secret: string
            try {
                [, secret] = parseAuthorizationHeader(authorizationHeader)
            } catch(_) {
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
                ctx.status = 412
                return
            }

            const authorizationHeader = ctx.headers.authorization
            let secret: string

            try {
                [, secret] = parseAuthorizationHeader(authorizationHeader)
            } catch(_) {
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
