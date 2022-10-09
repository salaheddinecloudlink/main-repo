import { createLambdaHandler } from '@neueparti/create-lambda-handler'
import { version } from './package.json'

export const userRegister = async ({ db, logger, userEmail }) => {
  try {
    const user = await db.User.findOne({ email: userEmail })

    if (!user) {
      return await db.User.create({ email: userEmail })
    }

    throw new Error('Already registered')
  } catch (e) {
    logger.error(e)
    throw e
  }
}

export const handler = createLambdaHandler(userRegister, {
  serviceVersion: version
})
