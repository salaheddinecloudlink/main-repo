import mongoose from 'mongoose'
import models from './models' // eslint-disable-line
const { STAGE } = process.env

let dbConnection = null

const MONGOOSE_CONFIG = {
  bufferCommands: true,
  socketTimeoutMS: 65000,
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4 // 4 (IPv4) or 6 (IPv6)
}

export const getConnection = async (uri) => {
  mongoose.set('autoCreate', STAGE !== 'prod')
  mongoose.set('autoIndex', STAGE !== 'prod')
  if (!dbConnection) {
    dbConnection = mongoose.connect(uri, MONGOOSE_CONFIG)
  }
  await dbConnection

  return mongoose
}

export const closeConnection = async (err) => {
  if (err) {
    console.log(err)
  }
  if (dbConnection) {
    await mongoose.connection.close()
    dbConnection = null
  }
}
