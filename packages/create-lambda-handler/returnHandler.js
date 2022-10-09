const { GIT_BRANCH, GIT_SHA, DEPLOY_TIME } = process.env

export const returnHandler =
  (version = '0.0.0') =>
  (body) => {
    const [returnBody, shouldStringify] = Array.isArray(body)
      ? [body[0], body[1]]
      : [body, true]
    const __meta = {
      gitBranch: GIT_BRANCH,
      gitSha: GIT_SHA,
      deployTime: DEPLOY_TIME,
      serverTime: new Date().toISOString(),
      serviceVersion: version
    }

    const result = {
      statusCode: 200,
      body: shouldStringify
        ? JSON.stringify({ ...returnBody, __meta })
        : returnBody
    }

    return result
  }
