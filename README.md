=# NeueStart

This is a monorepo managed with yarn and lerna. Each lambda will be independantly versioned and deployed but with the benifits of all the code in a single repository.

## Business Logic Documentation

## Conventions

Packages (lambda functions) should be in folders named the same as the serverless service name.

Packages ending with "endpoint" are HTTP endpoints and avaliable via API Gateway. Packages ending with "handler" are event driven and called when some event in the bucket happens (ex. file uploaded). See each .severless file for details.

AWS Lambda best practice dictates that we should only be deploying functions within VPC if the
function depends on resources within the VPC (i.e. data). If the Lambda is a pure function
with no side effects or internal resource access it should not be housed within the VPC. This helps to reduce cold start times for the function as well as reducing AWS resource usage.

## Development

`yarn start-db`: Run once if DB_URI isn't on.
`yarn dev`: Runs all serverless endpoints locally.
`yarn dev --printConfig`: for debugging local serverless offline configs.

This project utilizes `serverless-offline` and `serverless-bundle`.

Serverless offline allows for mocking Lambda infrastructure locally.

Serverless bundle uses webpack to bunlde each lambda with latest best configs.

## Development DB_URI

```zsh
brew tap mongodb/brew
brew install mongodb-community@4.4
For Intel Processor
mongod --config /usr/local/etc/mongod.conf &
For Apple M1 Processor
mongod --config /opt/homebrew/etc/mongod.conf &
```

## Development Config (VSCODE)

The following helper extensions will keep you sane (me too).

ESLint
Prettier
Editor Config

## How It Works

The directory structure like:

```zsh

package.json
/packages
  /sample-package
    index.js
    package.json
/services
  /service1
    handler.js
    package.json
    serverless.yml
  /service2
    handler.js
    package.json
    serverless.yml

```

#### .devcontainer/

Includes docker environment for running project in a dev container (OPTIONAL)

#### .github/

Inclues CI/CD Actions and Workflows for deployment

#### .husky/

Includes Precommit hooks

#### .vscode/

IDE Settings

#### .cicd/

Scripts and utils for DevOps and CICD work

#### frontend/

The frontend application(s)

#### packages/

Reusable packages for this repo

#### services/

Each folder represent a lambda function that lives in an API Gateway

### Services

Install an NPM package inside a service.

```bash
yarn add some-npm-package
```

Run a function locally.

```bash
serverless invoke local -f get
```

Run tests in a service.

```bash
yarn test
```

Deploy the service.

```bash
serverless deploy
```

Deploy a single function.

```bash
serverless deploy function -f get
```

To add a new service.

```bash
cd services/
serverless install --url https://github.com/AnomalyInnovations/serverless-nodejs-starter --name new-service
cd new-service
yarn
```

### Packages

Since each package has its own `package.json`, you can manage it just like you would any other NPM package.

To add a new package.

```bash
mkdir packages/new-package
yarn init
```

Packages can also be optionally published to NPM.

### FAQ & ISSUES

`[hardsource:e7bf5834] Could not freeze...` Blow away your .webpack
`module not found`... if it's a local file relying on a local package make sure you put the local package into package.json for whatever you're working on, then from top level run `yarn` so it'll wire up.
