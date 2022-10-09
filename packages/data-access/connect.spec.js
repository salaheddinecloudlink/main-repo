import * as connect from './connect'
import { afterEach } from '@jest/globals'

jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  connect: jest.fn(() => 'mockConnection'),
  plugin: jest.fn(() => 'mockPlugins'),
  connection: {
    close: jest.fn(() => 'mockClose')
  }
}))

describe('connect', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })
  test('getConnection should be singleton and connect', async () => {
    const result = await connect.getConnection()

    expect(result.connect._isMockFunction).toBe(true)
    expect(result.connect).toHaveBeenCalledTimes(1)
    await connect.getConnection()
    expect(result.connect).toHaveBeenCalledTimes(1)
  })

  test('closeConnection should succesfully be called', async () => {
    jest.mock('mongoose', () => ({
      ...jest.requireActual('mongoose'),
      connect: jest.fn(() => 'mockConnection'),
      plugin: jest.fn(() => 'mockPlugins'),
      connection: {
        close: jest.fn(() => 'mockClose')
      }
    }))
    const result = await connect.closeConnection()

    expect(result).toBe(undefined)
  })
})
