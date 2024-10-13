import { Mongoose, Model } from 'mongoose'

import { UserModel, UserModelData} from './UserModel'
import { MessageModel, MessageModelData } from './MessageModel'
import { UserSchema, UserSchemaInterface, MessageSchema, MessageSchemaInterface } from './schemas'

export class DatabaseManager {
    User: new (data: UserModelData) => UserModel
    Message: new (data: MessageModelData) => MessageModel

    UserModel: Model<UserSchemaInterface>
    MessageModel: Model<MessageSchemaInterface>
    constructor(public mongoose: Mongoose) {
        this.UserModel = mongoose.model<UserSchemaInterface>('User', UserSchema)
        this.MessageModel = mongoose.model<MessageSchemaInterface>('Message', MessageSchema)

        this.User = UserModel.bind(UserModel, this.UserModel)
        this.Message = MessageModel.bind(MessageModel, this.MessageModel, this.User)
    }
}
