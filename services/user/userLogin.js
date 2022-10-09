import { createLambdaHandler } from '@neueparti/create-lambda-handler'
import { version } from './package.json'

export const userLogin = async ({ db, logger, userEmail, password }) => {
  try {
    const user = await db.User.findOne({ email: userEmail })
    const isMatch = await user?.comparePassword(password)

    if (!isMatch || !user) {
      throw new Error('404')
    }

    return user
  } catch (e) {
    logger.error('userLogin', e)
    throw e
  }
}

export const handler = createLambdaHandler(userLogin, {
  serviceVersion: version
})
