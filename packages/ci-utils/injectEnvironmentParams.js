const injectEnvironmentParams = (coreConfig, serviceConfig) => {
  const { functions, ...restServiceConfig } = serviceConfig
  const {
    params: { default: defaultParams }
  } = coreConfig
  const functionsNames = Object.keys(functions)

  const result = {
    ...restServiceConfig,
    functions: {
      ...functionsNames.reduce(
        (acc, name) => ({
          ...acc,
          [name]: {
            ...functions[name],
            environment: {
              ...Object.keys(defaultParams).reduce(
                (env, key) => ({
                  ...env,
                  [key]: `\${param:${key}}`
                }),
                {
                  STAGE: '${sls:stage}' // eslint-disable-line
                }
              )
            }
          }
        }),
        {}
      )
    }
  }

  return result
}

module.exports = injectEnvironmentParams
