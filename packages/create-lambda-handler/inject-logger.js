import { createLogger } from 'bunyan'

const { SERVICE, STAGE, GIT_SHA } = process.env

let logger = null
export const makeLogger = () => {
  if (!logger) {
    logger = createLogger({
      name: `${SERVICE}-${STAGE}`,
      stage: STAGE,
      release: GIT_SHA,
      serviceName: SERVICE
    })
  }
  return logger
}

export const makeInjectLogger = (logger) => (handlerParams) => {
  return {
    logger,
    ...handlerParams
  }
}
