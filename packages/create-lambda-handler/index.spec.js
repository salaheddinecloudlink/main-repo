import { configureLambdaContext } from './configureLambdaContext'
import { createLambdaHandler } from './createLambdaHandler'
import { eventToPayload } from './eventToPayload'
import { injectDb } from './inject-db'
import { returnHandler } from './returnHandler'

import { beforeEach } from '@jest/globals'
import { faker } from '@faker-js/faker'

jest.mock('./eventToPayload', () => ({
  eventToPayload: jest.fn((payload) => ({ ...payload, _eventToPayload: true }))
}))

jest.mock('./inject-db', () => ({
  injectDb: jest.fn((payload) => ({ ...payload, _injectDb: true }))
}))

jest.mock('./returnHandler', () => ({
  returnHandler: jest.fn(() =>
    jest.fn((payload) => ({ ...payload, _returnHandler: true }))
  )
}))

jest.mock('./configureLambdaContext', () => ({
  configureLambdaContext: jest.fn((payload) => ({
    ...payload,
    _configureLambdaContext: true
  }))
}))

describe('createLambdaHandler', () => {
  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
  })

  test('createLambdaHandler should pipe through other functions', async () => {
    const mockHandler = jest.fn((payload) => ({ ...payload, _handler: true }))
    const wrappedHandler = createLambdaHandler(mockHandler)
    const mockEvent = {}
    const mockContext = {}

    const result = await wrappedHandler(mockEvent, mockContext)

    expect(configureLambdaContext).toHaveBeenCalledWith({
      _event: mockEvent,
      _context: mockContext
    })
    expect(eventToPayload).toHaveBeenCalledWith({
      _event: mockEvent,
      _context: mockContext,
      _configureLambdaContext: true
    })
    expect(injectDb).toHaveBeenCalledWith({
      _event: mockEvent,
      _context: mockContext,
      _configureLambdaContext: true,
      _eventToPayload: true
    })
    expect(mockHandler).toHaveBeenCalledWith({
      _event: mockEvent,
      _context: mockContext,
      _configureLambdaContext: true,
      _eventToPayload: true,
      _injectDb: true
    })
    expect(returnHandler).toHaveBeenCalledWith({
      _event: mockEvent,
      _context: mockContext,
      _configureLambdaContext: true,
      _eventToPayload: true,
      _injectDb: true,
      _handler: true
    })
    expect(result).toEqual({
      _event: mockEvent,
      _context: mockContext,
      _configureLambdaContext: true,
      _eventToPayload: true,
      _injectDb: true,
      _handler: true,
      _returnHandler: true
    })
  })

  test('createLambdaHandler should return formated error on exception', async () => {
    const mockHandler = jest.fn(() => {
      throw new Error('test')
    })
    const mockVersion = faker.system.semver()
    const wrappedHandler = createLambdaHandler(mockHandler, {
      useLogger: false,
      serviceVersion: mockVersion
    })
    const mockEvent = {}
    const mockContext = {}

    const result = await wrappedHandler(mockEvent, mockContext)

    expect(configureLambdaContext).toHaveBeenCalledWith({
      _event: mockEvent,
      _context: mockContext
    })
    expect(eventToPayload).toHaveBeenCalledWith({
      _event: mockEvent,
      _context: mockContext,
      _configureLambdaContext: true
    })
    expect(injectDb).toHaveBeenCalledWith({
      _event: mockEvent,
      _context: mockContext,
      _configureLambdaContext: true,
      _eventToPayload: true
    })
    expect(mockHandler).toHaveBeenCalledWith({
      _event: mockEvent,
      _context: mockContext,
      _configureLambdaContext: true,
      _eventToPayload: true,
      _injectDb: true
    })
    expect(returnHandler(mockVersion)).toHaveBeenCalledWith({
      _event: mockEvent,
      _context: mockContext,
      _configureLambdaContext: true,
      _eventToPayload: true,
      _injectDb: true
    })
    expect(result).toEqual({
      body: '{"name":"Error","message":"test"}',
      statusCode: 400
    })
  })
})
