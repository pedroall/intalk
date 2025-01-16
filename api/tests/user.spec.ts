import { it, expect, describe, beforeAll, afterAll } from '@jest/globals'
import Axios, { AxiosError, AxiosRequestConfig } from 'axios'
import 'dotenv/config'
import { ObjectId } from 'bson'

import path from 'node:path'

const baseURL = process.env['API_URL']

if (!baseURL) throw new Error('Missing environment variable API_URL')

const testsSecret = 'mySecret1234'
const randomObjectId = new ObjectId()

const makeUrl = (url: string) => path.join(baseURL, 'users', url)

// Create user for this test suits

interface User {
    id: string
}

type apiResponse<T> = T | string | undefined
type postUserResponse = apiResponse<User>
type getUserResponse = apiResponse<User>
type apiMethod = 'get' | 'delete' | 'post'

let user: User

async function testStatusCode(status: number, method: apiMethod, baseUrl: string, data: any = undefined, config: AxiosRequestConfig = {}) {
    const url = makeUrl(baseUrl)
    let requestStatus: number | null = null

    function handleError(error: any) {
        if(error instanceof AxiosError) {
            if(error.status) {
                requestStatus = error.status
                return
            }
        }
        throw error
    }

    method == 'post' ? await Axios.post(url, data, config).catch(error => handleError(error)) : await Axios[method](url, config).catch(error => handleError(error))

    expect(requestStatus).toBe(status)
}

beforeAll(async () => {
    const request = await Axios.post<postUserResponse>(
        makeUrl('/'),
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

describe('Should test GET method endpoint.', () => {
    it('Should request to GET an user with an invalid id and must return the error code 412', async () => {
        await testStatusCode(412, 'get', 'invalidId')
    })

    it('Shoult request to GET an user with an fake id and it should return an error 410', async () => {
        await testStatusCode(410, 'get', randomObjectId.toString())
    })

    it('Should request to GET the user created for this test suits and it must return an status code 200', async () => {
        const url = makeUrl(user.id)
        const request = await Axios.get<getUserResponse>(url)
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

async function testPassword(password: any) {
        let status: number | null = null
        await Axios.post(makeUrl('/'), undefined, {
            headers: {
                Authorization: password
            }
        }).catch(error => {
            if(error instanceof AxiosError) {
                if(error.status) {
                    status = error.status
                    return
                }
            }
            throw error
        })
        expect(status).toBe(401)
}

describe('Should test the POST method endpoint.', () => {
    it('Should request to POST an user without any authorization and expect it to return an error 401', async () => {
        await testPassword(undefined)
    })
    it('Should request to POST an user with no auth type field and expect it to return an error 401', async () => {
        await testPassword('somePassword')
    })
    it('Should request to POST an user with invalid auth type field and expect it to return an error 401', async () => {
        await testPassword('Alien somePassword')
    })

    it('Should request to POST an user with an invalid password field and expect it to return an error 401', async() => {
        await testPassword('Basic in@v#l$idpa$$wor+-%d')
    })
})

describe('Should test the DELETE method endpoint.', () => {
    it('Should request to DELETE an user without an id and expect it to return error 412', async() => {
        let status: number | null = null
        await Axios.delete(makeUrl('/InvalidId'))
            .catch(error => {
                if(error instanceof AxiosError) {
                    if(error.status) {
                        status = error.status
                        return;
                    }
                }
            })
        expect(status).toBe(412)
    })
    it('Should request to DELETE an user with an invalid id and expect it to return error 412', async() => {
        let status: number | null = null
        await Axios.delete(makeUrl('/invalidId'))
            .catch(error => {
                if(error instanceof AxiosError) {
                    if(error.status) {
                        status = error.status
                        return;
                    }
                }
                throw error
            })
        expect(status).toBe(412)
    })
    it('Should request to DELETE an user with an fake id and expect it to return error 401', async() => {
        let status: number | null = null
        await Axios.delete(makeUrl(`/${randomObjectId}`))
            .catch(error => {
                if(error instanceof AxiosError) {
                    if(error.status) {
                        status = error.status
                        return;
                    }
                }
                throw error
            })
        expect(status).toBe(401)
    })
})

afterAll(async () => {
    await Axios.delete(makeUrl(`/${user.id}`), {
        headers: {
            Authorization: `Basic ${testsSecret}`,
        },
    })

    console.log(`Deleting user ${user.id} for this test suits...`)
})
