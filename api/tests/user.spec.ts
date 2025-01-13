import { it, expect, describe, beforeAll, afterAll } from '@jest/globals'
import Axios, { AxiosError } from 'axios'
import 'dotenv/config'

import path from 'node:path'

const baseURL = process.env['API_URL']

if (!baseURL) throw new Error('Missing environment variable API_URL')
const testsSecret = 'mySecret1234'

const makeUrl = (url: string) => path.join(baseURL, url)

// Create user for this test suits

interface User {
    id: string
}

type postUserResponse = User | string | undefined

let user: User

beforeAll(async () => {
    const request = await Axios.post<postUserResponse>(
        makeUrl('/users/'),
        {},
        {
            headers: {
                Authorization: `Basic ${testsSecret}`,
            },
        },
    )

    const data = request.data

    if (!data) {
        throw new TypeError(`No data received.`)
    } else if (typeof data == 'string') {
        throw new TypeError(`Expected user object. Received: ${data}`)
    } else if (typeof data == 'object') {
        if (!data.id) {
            throw new TypeError('Received unexpected object!')
        } else {
            user = {
                id: data.id,
            }

            console.log(`Created user ${user.id} for this test suit...`)
        }
    } else {
        throw new TypeError(`Received unexpected object ${data}`)
    }
})

describe('Should test the endpoint with the GET method', () => {
    const api = Axios.create({
        baseURL,
    })

    it('Should request to GET an user without and with an invalid id and must return the error code 406', async () => {
        let status: number | null = null

        await api.get('/users/randomId').catch((error) => {
            if (error instanceof AxiosError) {
                if (error.status) status = error.status
            }
        })

        expect(status).toBe(406)
    })
})

afterAll(async() => {
    await Axios.delete(makeUrl(`/users/${user.id}`), {
        headers: {
            Authorization: `Basic ${testsSecret}`
        }
    })

    console.log(`Deleting user ${user.id} for this test suit...`)
})
