const childProcess = require('child_process')
const AWS = require('aws-sdk')
const yaml = require('js-yaml')
const fs = require('fs')

const {
  CloudFormationClient,
  DescribeStacksCommand,
  DeleteStackCommand
} = require('@aws-sdk/client-cloudformation')

console.log('deploying')
// Ops Iser for assuming.
// IAM User for assuming roles in other accounts
// arn:aws:iam::766387761748:user/github-actions
// [
//     "sts:GetSessionToken",
//     "sts:AssumeRole",
//     "sts:TagSession",
//     "sts:GetFederationToken",
//     "sts:GetAccessKeyInfo",
//     "sts:GetCallerIdentity",
//     "sts:GetServiceBearerToken"
// ]

// IAM Role For doing the deployment
// [
//     "sts:TagSession",
//     "sts:AssumeRole",
//     "secretsmanager:GetSecretValue",
//     "secretsmanager:DescribeSecret",
//     "s3:*",
//     "route53:*",
//     "logs:*",
//     "lambda:*",
//     "kms:Verify",
//     "kms:Sign",
//     "kms:List*",
//     "kms:Encrypt",
//     "kms:Describe*",
//     "kms:Decrypt",
//     "iam:PutRolePolicy",
//     "iam:PassRole",
//     "iam:List*",
//     "iam:Get*",
//     "iam:CreateRole",
//     "events:*",
//     "ec2:Describe*",
//     "cloudfront:*",
//     "cloudformation:*",
//     "apigateway:*",
//     "acm:*"
// ]

const ROOT_DIR = '..'
const SERVICE = process.env.SERVICE
const ENV = process.env.ENV
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID
const AWS_REGION = process.env.AWS_REGION
const AWS_SECRETS_MANAGER_KEY = process.env.AWS_SECRETS_MANAGER_KEY
const DOMAIN_NAME = process.env.DOMAIN_NAME
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME
const DEPLOYMENT_IAM_ROLE_ARN = process.env.DEPLOYMENT_IAM_ROLE_ARN

const GIT_SHA = childProcess
  .execSync('git symbolic-ref --short HEAD')
  .toString()
  .trim()
const GET_BRANCH = childProcess
  .execSync(`git rev-parse --short refs/remotes/origin/${GIT_SHA}`)
  .toString()
  .trim()
const DEPLOY_TIME = new Date().toISOString()

// Get json object from Secrets Manager
async function getSecretsFromAWSSecretsManager({
  region,
  secretId,
  credentials
}) {
  const secretsManager = new AWS.SecretsManager({
    region,
    credentials
  })
  const { SecretString } = await secretsManager
    .getSecretValue({ SecretId: secretId })
    .promise()
  return JSON.parse(SecretString)
}

// Anything set in Object will be populated as Environment variables
async function setObjectAsEnvVars(obj) {
  Object.entries(obj).forEach(([key, value]) => {
    process.env[key] = value
  })
}

// Spwan a command and pipe output
function spawnCmd(cmd) {
  const [command, ...args] = cmd.split(' ')
  let success = false
  var child = childProcess.spawn(command, args)

  child.stdout.on('data', function (data) {
    process.stdout.write(data.toString())
  })

  child.stderr.on('data', function (data) {
    const outStr = data.toString()
    if (outStr.includes('Service deployed to')) {
      success = true
    }
    process.stdout.write(data.toString())
  })

  child.on('close', function (code) {
    console.log('Finished with code ' + code)
    if (!success) {
      throw new Error('Deployment failed')
    }
  })
}

// async timeout helper
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

// Sometimes a CloudFormation stack gets into a bad state. This deletes it so you can proceed for the next run
async function cleanBrokenStack(service, env, credentials) {
  const client = new CloudFormationClient({ credentials })

  const stackName = `${service}-${env}`
  try {
    const describeCmd = new DescribeStacksCommand({
      StackName: stackName,
      credentials
    })
    const describeResponse = await client.send(describeCmd)

    const stackStatus = describeResponse.Stacks[0].StackStatus
    if (stackStatus === 'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS') {
      console.log(
        `Service ${service} can not be deployed right now because the stack is in the state: ${stackStatus}.`
      )
      const waitForStackToBeReady = async () => {
        console.log('Waiting for stack to be ready...')
        await sleep(1)
        const describeResponse = await client.send(describeCmd)
        const stackStatus = describeResponse.Stacks[0].StackStatus
        if (stackStatus === 'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS') {
          return await waitForStackToBeReady()
        }
      }
      await waitForStackToBeReady()
    }
    if (
      stackStatus === 'ROLLBACK_COMPLETE' ||
      stackStatus === 'ROLLBACK_FAILED' ||
      stackStatus === 'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS'
    ) {
      const deleteCmd = new DeleteStackCommand({ StackName: stackName })
      const deleteResponse = await client.send(deleteCmd)
      console.log(
        `Service ${service} deleted because its status was ${stackStatus}`
      )
      console.log(deleteResponse)
    }
  } catch (error) {
    console.log(error.message)
  }
}

// Get credentials for the deployment IAM role
async function getRoleCredentialsForAssumption({
  roleArn,
  roleSessionName,
  durationInSeconds = 7400
}) {
  const sts = new AWS.STS({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
  })

  const { Credentials } = await sts
    .assumeRole({
      RoleArn: roleArn,
      RoleSessionName: roleSessionName,
      DurationSeconds: durationInSeconds
    })
    .promise()
  return {
    accessKeyId: Credentials.AccessKeyId,
    secretAccessKey: Credentials.SecretAccessKey,
    sessionToken: Credentials.SessionToken
  }
}

// inject deployment specific variables into the config before deployment.
function injectIntoServerlessConfigYaml() {
  const serverlessConfig = fs.readFileSync(
    `${ROOT_DIR}/serverless_core.yml`,
    'utf8'
  )
  const overlayConfig = fs.readFileSync(`./overlay.yml`, 'utf8')
  const overlayYaml = yaml.load(overlayConfig)
  const serverlessConfigYaml = yaml.load(serverlessConfig)
  const envYaml = overlayYaml[ENV]
  serverlessConfigYaml.provider = {
    ...serverlessConfigYaml.provider,
    apiGateway: {
      ...serverlessConfigYaml.provider.apiGateway,
      restApiId: envYaml.provider.apiGateway.restApiId,
      restApiRootResourceId: envYaml.provider.apiGateway.restApiRootResourceId
    },
    logRetentionInDays: envYaml.provider.logRetentionInDays,
    vpc: {
      securityGroupIds: envYaml.provider.vpc.securityGroupIds,
      subnetIds: envYaml.provider.vpc.subnetIds
    }
  }

  fs.writeFileSync(
    `${ROOT_DIR}/serverless_core.yml`,
    yaml.dump(serverlessConfigYaml)
  )
  return serverlessConfigYaml
}

// Main deployment function
async function deploy() {
  // Assume IAM Role
  const deploymentRoleCredentials = await getRoleCredentialsForAssumption({
    roleArn: DEPLOYMENT_IAM_ROLE_ARN,
    roleSessionName: 'serverless_deployment',
    durationInSeconds: 3600
  })

  // Get secrets from Secrets Manager
  const awsSecrets = await getSecretsFromAWSSecretsManager({
    region: AWS_REGION,
    secretId: AWS_SECRETS_MANAGER_KEY,
    credentials: deploymentRoleCredentials
  })

  // Ensure stack is in state that we can deploy
  console.log('Checking stack status')
  await cleanBrokenStack(SERVICE, ENV, deploymentRoleCredentials)

  // Build environment variables
  const envVarsToSet = {
    ENV,
    AWS_ACCOUNT_ID,
    AWS_REGION,
    AWS_SECRETS_MANAGER_KEY,
    DOMAIN_NAME,
    EVENT_BUS_NAME,
    GIT_SHA,
    GET_BRANCH,
    DEPLOY_TIME,
    ...awsSecrets,
    AWS_ACCESS_KEY_ID: deploymentRoleCredentials.accessKeyId,
    AWS_SECRET_ACCESS_KEY: deploymentRoleCredentials.secretAccessKey,
    AWS_SESSION_TOKEN: deploymentRoleCredentials.sessionToken
  }

  // Set environment variables
  setObjectAsEnvVars(envVarsToSet)

  // Write serverless config file
  injectIntoServerlessConfigYaml()

  console.log(`Deploying ${SERVICE} to ${ENV}`)
  process.chdir(`${ROOT_DIR}/services/${SERVICE}`)
  spawnCmd(`yarn serverless deploy --stage ${ENV}`)
}

deploy()
  .then((_) => console.log('Done'))
  .catch((e) => {
    console.error(e)
    process.exit(1)
    throw e
  })
