import { Schema } from 'mongoose'

import { validateSecret } from '@intalk/helpers'

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
            validator: validateSecret,
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
