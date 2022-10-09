import { createEventBridge } from './createEventBridge'

it('Should create a local event bridge', () => {
  const eventBridge = createEventBridge()
  expect(eventBridge).toBeDefined()
  expect(eventBridge.config.endpoint).toEqual('http://127.0.0.1:4010')
})

it('should create a remote event bridge', () => {
  const eventBridge = createEventBridge(false)
  expect(eventBridge).toBeDefined()
})
