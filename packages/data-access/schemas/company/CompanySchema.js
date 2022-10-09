import { Schema } from 'mongoose'

export const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      description: 'Company name'
    }
  },
  {
    description: 'A Company.',
    timestamps: true
  }
).index({ name: 1 }, { unique: true })
