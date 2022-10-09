import { asyncPipe } from '@neueparti/neue-utils/asyncPipe'
import { closeConnection } from '@neueparti/data-access/connect'
import { configureLambdaContext } from './configureLambdaContext'
import { eventToPayload } from './eventToPayload'
import { injectDb } from './inject-db'
import { makeInjectLogger, makeLogger } from './inject-logger'
import { returnHandler } from './returnHandler'

const createHandler =
  (fn, version = '0.0.0') =>
  async (event, context) => {
    const logger = makeLogger()
    try {
      process.setMaxListeners(0)
      const wrappedHandler = asyncPipe(
        configureLambdaContext, // ensure no waiting for event loop. Helps with DB.
        eventToPayload, // hoist all important inputs to top level.
        injectDb, // probably need a database connection.
        makeInjectLogger(logger), // inject logger into context.
        fn, // the actual handler
        returnHandler(version) // parse the results,
      )
      return await wrappedHandler({ _event: event, _context: context }) // puts both event and context on same input object. No tuples yet.
    } catch (error) {
      logger.error(error)
      return {
        statusCode: 400,
        body: JSON.stringify(error)
      }
    } finally {
      if (process?.env?.STAGE !== 'dev') {
        await closeConnection()
      }
    }
  }

export const createLambdaHandler = (
  fn,
  options = { serviceVersion: '0.0.0' }
) => {
  const handler = createHandler(fn, options?.serviceVersion)
  return handler
}
