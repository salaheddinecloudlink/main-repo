import { beforeEach } from '@jest/globals'
import { getConnection } from '@neueparti/data-access'
import { injectDb } from './inject-db'

jest.mock('@neueparti/data-access', () => ({
  getConnection: jest.fn(() => 'mockConnection')
}))

beforeEach(() => {
  jest.resetModules()
})

test('injectDb', async () => {
  const event = { blah: 123 }
  const result = await injectDb(event)
  expect(getConnection).toHaveBeenCalled()
  expect(result).toEqual({ ...event, db: 'mockConnection' })
})
