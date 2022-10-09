import { returnHandler } from './returnHandler'

test('returnHandler', () => {
  const mockBody = { test: 123, blah: 234 }
  const result = returnHandler(mockBody)
  expect(result).toEqual({
    statusCode: 200,
    body: JSON.stringify(mockBody)
  })
})
