import AWS from 'aws-sdk'

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN
const AWS_REGION = process.env.AWS_REGION

export const createEventBridge = (
  isOffline = process.env.IS_OFFLINE === 'true'
) => {
  const eventBridgeConfig = isOffline
    ? {
        endpoint: 'http://127.0.0.1:4010',
        region: AWS_REGION
      }
    : {
        region: AWS_REGION,
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
        sessionToken: AWS_SESSION_TOKEN
      }
  return new AWS.EventBridge(eventBridgeConfig)
}
