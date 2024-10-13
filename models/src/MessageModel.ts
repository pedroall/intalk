import { Model } from 'mongoose'
import { ObjectId, ObjectIdLike } from 'bson'

import { DatabaseError } from './DatabaseError'
import { parseId, parseSecret } from '@intalk/helpers'

import { UserModel, UserModelData } from './UserModel'
import { MessageSchemaInterface } from './schemas'

export enum MessageErrors {
    InvalidId,
    InvalidUserId,
    InvalidContent,

    Unauthorized,
}

const { InvalidId, InvalidUserId, InvalidContent, Unauthorized } =
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

export class MessageModel {
    id: ObjectId | null
    userId: ObjectId | null
    content: string | null

    constructor(
        public Message: Model<MessageSchemaInterface>,
        public User: new(data: UserModelData) => UserModel,

        { id = null, userId = null, content = null }: MessageModelData
    ) {
        if (id && !isValidOid(id)) throw error(InvalidId)
        if (userId && !isValidOid(userId)) throw error(InvalidUserId)

        if (content && (content.length < 8 || content.length > 512))
            throw error(InvalidContent)

        if(userId) this.userId = new ObjectId(userId)
        else this.userId = null

        if (id) this.id = new ObjectId(id)
        else this.id = null

        this.content = content
    }

    async fetch() {
        const { Message, id } = this

        if (!id) throw error(InvalidId)
        if (!isValidOid(id)) throw error(InvalidId)

        const message = await Message.findById(id)

        if(!message) throw error(InvalidId)

        this.content = message.content
        this.userId = new ObjectId(message.user)

        return this
    }

    async post(secret: string) {
        const { Message, User, userId, content } = this

        if (!userId || !isValidOid(userId)) throw error(InvalidUserId)

        if (!validateSecret(secret)) throw error(Unauthorized)
        if (!content || content.length < 8 || content.length > 512)
            throw error(InvalidContent)

        const user = new User({
            id: userId,
            secret
        })

        await user.fetch()

        if (user.deleted) throw error(InvalidUserId)

        if (secret != user.secret) throw error(Unauthorized)

        const message = await Message.create({
            content,
            user: userId
        })

        this.id = message.id



        return this
    }
}
