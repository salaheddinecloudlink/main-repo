export class ExpectedError extends Error {
  constructor(name, ...rest) {
    super(...rest)
    this.reportError = false
    this.name = name
    this.message = rest?.message
  }

  toString() {
    return JSON.stringify(this, null, 3)
  }
}

export class UnexpectedError extends Error {
  constructor(message, options) {
    super(message, options)
    this.reportError = true
    this.name = options?.name
    this.message = message
  }

  toString() {
    return JSON.stringify(this, null, 3)
  }
}

export class ObjectNotFound extends ExpectedError {
  constructor(...rest) {
    super('ObjectNotFound', ...rest)
    this.type = 'ObjectNotFound'
    this.name = 'ObjectNotFound'
  }
}

export class SDKValidationError extends UnexpectedError {
  constructor(...rest) {
    super('SDKValidationError', ...rest)
    this.type = 'SDKValidationError'
    this.name = 'SDKValidationError'
  }
}

export class NotYetImplimentedError extends UnexpectedError {
  constructor(...rest) {
    super('NotYetImplimentedError', ...rest)
    this.type = 'NotYetImplimentedError'
    this.name = 'NotYetImplimentedError'
  }
}
