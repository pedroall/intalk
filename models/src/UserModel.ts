import { Model } from 'mongoose'
import { DatabaseError } from './DatabaseError'
import { parseId, parseSecret, If } from '@intalk/helpers'
import { ObjectId, ObjectIdLike } from 'bson'
import { UserSchemaInterface } from './schemas'
import { MessageModel } from './MessageModel'

export type IdFetched<F extends boolean> = If<F, ObjectId, ObjectId | null >
export type deleteFetched<F extends boolean> = If<F, false, true>

export enum UserErrorCodes {
    Unauthorized,
    InvalidId,
    InvalidCredentials
}

export class UserError extends DatabaseError<UserErrorCodes> {
    constructor(code: UserErrorCodes) {
        super(code)
    }
}

const error = UserError.error

export const { Unauthorized, InvalidId, InvalidCredentials } = UserErrorCodes

export interface UserModelData {
    id?: ObjectIdLike | null,
    secret?: string | null,
    deleted?: boolean,
}

export class UserModel<F extends boolean = false> {
    id: IdFetched<F>
    secret: string | null
    deleted: deleteFetched<F>

    constructor(
        public User: Model<UserSchemaInterface>,

        {
            id = null,
            secret = null,
            deleted = true,
        } : UserModelData
    ) {
        try {
            this.id = parseId(id)
        } catch(_) {
            this.id = null as IdFetched<F>
        }

        this.secret = secret
        this.deleted = deleted as deleteFetched<F>
    }

    async fetch() {
        const { User, id } = this
        const parsedId = parseId(id)

        const user = await User.findById(parsedId)

        if (!user) {
            this.deleted = true as deleteFetched<F>
            throw error(InvalidId)
        } else {
            this.deleted = false as deleteFetched<F>
            return this as UserModel<true>
        }
    }

    async create() {
        const { User, secret } = this
        
        const parsedSecret = parseSecret(secret)

        const user = await User.create({
            secret: parsedSecret
        })

        this.id = user._id
        this.deleted = false as deleteFetched<F>

        return this as UserModel<true>
    }

    async edit(data: { secret: string }) {
        const { User, id, secret } = this
        
        const parsedId = parseId(id)
        const parsedSecret = parseSecret(secret)

        const parsedNewSecret = parseSecret(data.secret)

        const user = await User.findOneAndUpdate({
            _id: parsedId,
            secret: parsedSecret
        }, {
            secret: parsedNewSecret
        })

        if(!user) throw error(InvalidCredentials)

        this.secret = data.secret

        return this as UserModel<true>
    }

    async delete() {
        const { User, id, secret } = this

        const parsedId = parseId(id)
        const parsedSecret = parseSecret(secret)

        const user = await User.deleteOne({
            _id: parsedId,
            secret: parsedSecret
        })

        this.deleted = user.acknowledged as deleteFetched<F>

        return this as UserModel<false>
    }

    async linkMessage(message: MessageModel<true>) {
        const { User, id, secret } = this

        const parsedId = parseId(id)
        const parsedMessageId = parseId(message.id)
        const parsedSecret = parseSecret(secret)

        const user = await User.findOne({
            _id: parsedId,
            secret: parsedSecret
        })
 
        if(!user) throw error(InvalidCredentials)

        user.messages.push(parsedMessageId.toString())

        await user.save()

        return this as UserModel<true>
    }
}
