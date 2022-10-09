import { CompanySchema } from './schemas/company/CompanySchema'
import { UserSchema } from './schemas/user/UserSchema'
import mongoose from 'mongoose'

mongoose.plugin((schema) => {
  schema.set('toObject', { virtuals: true })
  schema.set('toJSON', { virtuals: true })
  schema.set('timestamps', true)
})

const models = {
  User: UserSchema,
  Company: CompanySchema
}

Object.keys(models).forEach((modelName) => {
  try {
    models[modelName] = mongoose.model(modelName)
  } catch {
    models[modelName] = mongoose.model(modelName, models[modelName])
  }
})

export default models
