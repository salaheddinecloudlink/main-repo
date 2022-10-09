import { Chance } from 'chance'
import {
  eventToPayload,
  hoistDetail,
  hoistEventBody,
  hoistEventBridge,
  hoistEventRecords,
  hoistMultiValueQueryStringParameters,
  hoistPathParameters,
  hoistQueryStringParameters
} from './eventToPayload'

const chance = new Chance()
const getChanceObj = () => {
  return {
    [chance.string()]: chance.string()
  }
}

test('hoistPathParameters', () => {
  const event = {
    _event: {
      ...getChanceObj(),
      pathParameters: getChanceObj()
    },
    _context: getChanceObj()
  }
  const result = hoistPathParameters(event)
  expect(result).toEqual({
    _event: event._event,
    _context: event._context,
    ...event._event.pathParameters
  })
})

test('hoistQueryStringParameters', () => {
  const event = {
    _event: {
      ...getChanceObj(),
      queryStringParameters: getChanceObj()
    },
    _context: getChanceObj()
  }
  const result = hoistQueryStringParameters(event)
  expect(result).toEqual({
    _event: event._event,
    _context: event._context,
    ...event._event.queryStringParameters
  })
})

test('hoistMultiValueQueryStringParameters', () => {
  const event = {
    _event: {
      ...getChanceObj(),
      multiValueQueryStringParameters: {
        param1: [getChanceObj(), getChanceObj()],
        param2: [getChanceObj()]
      },
      _context: getChanceObj()
    }
  }

  const result = hoistMultiValueQueryStringParameters(event)
  expect(result).toEqual({
    _event: event._event,
    _context: event._context,
    param1: event._event.multiValueQueryStringParameters.param1
  })
})

test('hoistMultiValueQueryStringParameters return if not exist', () => {
  const event = {
    _event: {
      ...getChanceObj(),
      _context: getChanceObj()
    }
  }

  const result = hoistMultiValueQueryStringParameters(event)
  expect(result).toEqual({
    _event: event._event,
    _context: event._context
  })
})

test('hoistEventBody', () => {
  const event = {
    _event: {
      ...getChanceObj(),
      body: getChanceObj()
    },
    _context: getChanceObj()
  }

  const result = hoistEventBody(event)
  expect(result).toEqual({
    _event: event._event,
    _context: event._context,
    ...event._event.body
  })
})

test('hoistEventBody no body', () => {
  const event = {
    _event: {
      ...getChanceObj()
    },
    _context: getChanceObj()
  }

  const result = hoistEventBody(event)
  expect(result).toEqual({
    _event: event._event,
    _context: event._context
  })
})

test('hoistEventBody JSON', () => {
  const event = {
    _event: {
      ...getChanceObj(),
      body: JSON.stringify(getChanceObj())
    },
    _context: getChanceObj()
  }

  const result = hoistEventBody(event)
  expect(result).toEqual({
    _event: event._event,
    _context: event._context,
    ...JSON.parse(event._event.body)
  })
})

test('hoistEventRecords', () => {
  const event = {
    _event: {
      ...getChanceObj(),
      Records: getChanceObj()
    },
    _context: getChanceObj()
  }

  const result = hoistEventRecords(event)
  expect(result).toEqual({
    _event: event._event,
    _context: event._context,
    ...event._event.Records
  })
})

test('hoistEventBridge', () => {
  const event = {
    _event: {
      ...getChanceObj(),
      event_bridge: getChanceObj()
    },
    _context: getChanceObj()
  }

  const result = hoistEventBridge(event)
  expect(result).toEqual({
    _event: event._event,
    _context: event._context,
    ...event._event.event_bridge
  })
})

test('hoistDetail', () => {
  const event = {
    _event: {
      ...getChanceObj(),
      detail: getChanceObj()
    },
    _context: getChanceObj()
  }

  const result = hoistDetail(event)
  expect(result).toEqual({
    _event: event._event,
    _context: event._context,
    ...event._event.detail
  })
})

test('eventToPayload', async () => {
  const event = {
    _event: {
      ...getChanceObj(),
      body: getChanceObj(),
      pathParameters: getChanceObj(),
      queryStringParameters: getChanceObj(),
      multiValueQueryStringParameters: {
        param1: [getChanceObj(), getChanceObj()],
        param2: [getChanceObj()]
      },
      detail: getChanceObj(),
      Records: getChanceObj(),
      event_bridge: getChanceObj()
    },
    _context: getChanceObj()
  }
  const result = await eventToPayload(event)
  expect(result).toEqual({
    _event: event._event,
    ...event._event.body,
    ...event._event.pathParameters,
    ...event._event.queryStringParameters,
    param1: event._event.multiValueQueryStringParameters.param1,
    ...event._event.detail,
    ...event._event.Records,
    ...event._event.event_bridge,
    _context: event._context
  })
})
