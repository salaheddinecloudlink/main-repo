import { Schema } from 'mongoose'

export const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      description: 'User email'
    },
    lastLoginDate: {
      type: Date,
      required: false,
      description: 'Last login date'
    },
    companyId: {
      type: Schema.Types.ObjectId,
      required: true,
      description: 'Company id'
    }
  },
  {
    description: 'A user.',
    timestamps: true
  }
).index({ email: 1 }, { unique: true })
