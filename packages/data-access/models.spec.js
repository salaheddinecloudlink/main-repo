import models from './models'

test('Verify Models export', () => {
  expect(models.User).toBeDefined()
  expect(models.Company).toBeDefined()
})
