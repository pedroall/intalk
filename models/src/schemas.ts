import { Schema } from 'mongoose'

import { parseSecret } from '@intalk/helpers'

export interface UserSchemaInterface {
    secret: string
    messages: string[]
}

export interface MessageSchemaInterface {
    user: string,
    content: string,
}

export const UserSchema = new Schema<UserSchemaInterface>({
    secret: {
        type: String,
        min: 0,
        max: 512,
        validate: {
            validator: (secret) => {
                try {
                    parseSecret(secret)
                    return true
                } catch(_) {
                    return false
                }
            },
            message: () => 'invalid'
        }
    },
    messages: [String]
})

export const MessageSchema = new Schema<MessageSchemaInterface>({
    user: String,                                                 
    content: {
        type: String,
        min: 0,
        max: 512
    }
})
