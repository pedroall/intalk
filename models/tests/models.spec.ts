import { DatabaseManager } from '../src/DatabaseManager'
import { UserModel } from '../src/UserModel'
import { MessageModel } from '../src/MessageModel'
import mongoose from 'mongoose'

import { it, expect, describe, beforeAll, afterAll } from '@jest/globals'

import 'dotenv/config'

const dbUrl = process.env['DATABASE_URL']
if (!dbUrl) throw new Error('Missing environment variable Database URL')

let database: DatabaseManager

beforeAll(async () => {
    const client = await mongoose.connect(dbUrl)
    database = new DatabaseManager(client)
})

const secret = '12345678'
const newSecret = 'foobar123'

let user: UserModel
let message: MessageModel

describe('Test user model', () => {
    it('Test user create', async () => {
        user = new database.User({})

        user.secret = secret

        await user.create()

        if (!user.id) throw new Error('User was not created')

        expect(user.deleted).toBeFalsy()
    })

    it('Test user get', async () => {
        const toFetch = new database.User({
            id: user.id,
        })
        await toFetch.fetch()

        expect(toFetch.deleted).toBeFalsy()

        if (!toFetch.id) throw new Error('expected id received null')
        if (!user.id) throw new Error('User was not created')

        expect(toFetch.id.toString()).toBe(user.id.toString())
    })

    it('Test user edit', async () => {
        await user.edit({
            secret: newSecret,
        })

        expect(secret == user.secret).toBeFalsy()
    })
})

describe('Test message model', () => {
    it('Test message create', async () => {
        message = new database.Message({})
        message.content = 'Hello, world!'
        message.userId = user.id

        const fetchedUser = await user.fetch()

        await message.post(fetchedUser, newSecret)
    })
    it('Test message fetch', async () => {
        const toFetch = new database.Message({
            id: message.id,
        })

        await toFetch.fetch()

        if (!toFetch.id) throw new Error('Message was not posted')
        if (!message.id) throw new Error('Message was not created')

        expect(toFetch.id.toString()).toBe(message.id.toString())
    })
})

afterAll(async () => {
    console.debug(`Deleting user ${user.id} for this test suits`)
    await user.delete()
    expect(user.deleted).toBeTruthy()
    await database.mongoose.connection.close()
})
