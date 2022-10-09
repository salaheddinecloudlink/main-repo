import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserSchema } from './UserSchema'
import { afterAll, afterEach, beforeAll } from '@jest/globals'
import { faker } from '@faker-js/faker'
import mongoose from 'mongoose'

describe('UserSchema', () => {
  let conn
  let mongoServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    conn = await mongoose.connect(mongoServer.getUri(), {})
  })

  afterAll(async () => {
    await conn.disconnect()
    await mongoServer.stop()
  })

  afterEach(async () => {
    await conn.connection.dropDatabase()
  })

  test('should succesfully create a user', async () => {
    const mockUser = {
      email: faker.internet.email()
    }
    const UserModel = mongoose.model('User', UserSchema)
    const mockUserInstance = await UserModel.create(mockUser)
    expect(mockUserInstance.email).toEqual(mockUser.email)
  })
})
