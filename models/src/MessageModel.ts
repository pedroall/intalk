import { Model } from 'mongoose'
import { ObjectId, ObjectIdLike } from 'bson'

import { DatabaseError } from './DatabaseError'
import { parseId, parseSecret, parseContent, If } from '@intalk/helpers'

import { UserModel, UserModelData } from './UserModel'
import { MessageSchemaInterface } from './schemas'

export enum MessageErrors {
    InvalidId,
    InvalidUserId,

    Unauthorized,
}

export type IdFetched<F extends boolean> = If<F, ObjectId, ObjectId | null>
export type ContentFetched<F extends boolean> = If<F, string, string | null>

const { InvalidId, InvalidUserId, Unauthorized } =
    MessageErrors

export class MessageError extends DatabaseError<MessageErrors> {
    constructor(code: MessageErrors) {
        super(code)
    }
}

const error = MessageError.error

export interface MessageModelData {
    id?: ObjectIdLike | null
    userId?: ObjectIdLike | null
    content?: string | null,
    timestamp?: Date
}

export class MessageModel<F extends boolean = false> {
    id: IdFetched<F> 
    userId: IdFetched<F>
    content: ContentFetched<F>

    constructor(
        public Message: Model<MessageSchemaInterface>,
        public User: new(data: UserModelData) => UserModel,

        { id = null, userId = null, content = null }: MessageModelData
    ) {
        try {
            this.id = parseId(id)
        } catch(_) {
            this.id = null as IdFetched<F>
        }
        try {
            this.userId = parseId(userId)
        } catch(_) {
            this.userId = null as IdFetched<F>
        }
        try {
            this.content = parseContent(content)
        } catch(_) {
            this.content = null as ContentFetched<F>
        }
    }

    async fetch() {
        const { Message, id } = this

        const parsedId = parseId(id)
        const message = await Message.findById(parsedId)

        if(!message) throw error(InvalidId)

        this.content = message.content
        this.userId = new ObjectId(message.user)

        return this as MessageModel<true>
    }

    async post(target: UserModel<true>, secret: string) {
        const { Message, User, userId, content } = this

        const parsedUserId = parseId(userId)
        const parsedSecret = parseSecret(secret)
        const parsedContent = parseContent(content)

        const user = new User({
            id: parsedUserId,
            secret: parsedSecret
        })

        const userFetched = await user.fetch()

        if (userFetched.deleted) throw error(InvalidUserId)

        if (parsedSecret != userFetched.secret) throw error(Unauthorized)

        const message = await Message.create({
            content: parsedContent,
            user: parsedUserId
        })

        this.id = message.id

        await target.linkMessage(this as MessageModel<true>)

        return this as MessageModel<true>
    }
}
