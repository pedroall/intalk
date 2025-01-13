import { it, expect, describe, beforeAll, afterAll } from '@jest/globals'
import Axios, { AxiosError } from 'axios'
import 'dotenv/config'
import { ObjectId } from 'bson'

import path from 'node:path'

const baseURL = process.env['API_URL']

if (!baseURL) throw new Error('Missing environment variable API_URL')

const testsSecret = 'mySecret1234'
const randomObjectId = new ObjectId()

const makeUrl = (url: string) => path.join(baseURL, url)

// Create user for this test suits

interface User {
    id: string
}

type apiResponse<T> = T | string | undefined
type postUserResponse = apiResponse<User>
type getUserResponse = apiResponse<User>

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

            console.log(`Created user ${user.id} for this test suits...`)
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

        expect(status).toBe(412)
    })

    it('Shoult request to GET an user with an fake id and it should return an error 410', async () => {
        let status: number | null = null
        await api.get(`/users/${randomObjectId.toString()}`).catch((error) => {
            if (error instanceof AxiosError) {
                if (error.status) status = error.status
            }
        })

        expect(status).toBe(410)
    })

    it('Should request to GET the user created for this test suits and it must return an status code 200', async () => {
        const request = await api.get<getUserResponse>(`/users/${user.id}`)

        expect(request.status).toBe(200)

        const body = request.data

        if (typeof body != 'object' || !body.id) {
            throw new Error(
                'Expected request to be an object and include an id property',
            )
        }

        expect(body.id).toBe(user.id)
    })
})

describe('Should test all endpoints with the POST method', () => {
    it('Should request to POST an user without any authorization and expect it to return an error 401', async () => {
        let status: number | null = null
        await Axios.post(makeUrl('/users/')).catch((error) => {
            if (error instanceof AxiosError) {
                if (error.status) status = error.status
            } else {
                throw error
            }
        })
        expect(status).toBe(401)
    })
    it('Should request to POST an user with no auth type field and expect it to return an error 401', async () => {
        let status: number | null = null
        await Axios.post(makeUrl('/users/'), undefined, {
            headers: {
                Authorization: 'somePassword',
            },
        }).catch((error) => {
            if (error instanceof AxiosError) {
                if (error.status) status = error.status
            }
        })
        expect(status).toBe(401)
    })
    it('Should request to POST an user with invalid auth type field and expect it to return an error 401', async () => {
        let status: number | null = null
        await Axios.post(makeUrl('/users/'), undefined, {
            headers: {
                Authorization: 'Alien somePassword',
            },
        }).catch((error) => {
            if (error.status) status = error.status
        })

        expect(status).toBe(401)
    })

    it('Should request to POST an user with an invalid password field and expect it to return an error 401', async() => {
        let status: number | null = null
        await Axios.post(makeUrl('/users/'), undefined, {
            headers: {
                Authorization: 'Basic in@@valid#&%$!password??[{)'
            }
        })
        .catch(error => {
            if(error instanceof AxiosError) {
                if(error.status)
                    status = error.status
            }
        })

        expect(status).toBe(401)
    })
})

afterAll(async () => {
    await Axios.delete(makeUrl(`/users/${user.id}`), {
        headers: {
            Authorization: `Basic ${testsSecret}`,
        },
    })

    console.log(`Deleting user ${user.id} for this test suits...`)
})
