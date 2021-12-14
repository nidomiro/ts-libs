# @nidomiro/config-helper

[![npm (scoped)](https://img.shields.io/npm/v/@nidomiro/config-helper)](https://www.npmjs.com/package/@nidomiro/config-helper) ![GitHub branch checks state](https://img.shields.io/github/checks-status/nidomiro/ts-tools/main?label=build)

This library makes it easy to create configurable apps. For microservices this is especially useful if you want to create a [Twelve-Factor App](https://12factor.net).

The library was inspired by [node-convict](https://github.com/mozilla/node-convict) but rewritten in typescript and with some useful extra features.

## Installation

npm

```shell
npm install @nidomiro/config-helper
```

yarn

```shell
yarn add @nidomiro/config-helper
```

## Quick Start

To start execute `createConfig` and store it's return value in a variable.
The first parameter represents the configuration schema.
Here you define what parameters you want to have and how they are converted and validated.

Example:

```typescript
import { booleanParam, createConfig, numberParam, regexParam, stringParam } from '@nidomiro/config-helper'

export const config = createConfig({
	env: stringParam({ defaultValue: 'production', envVar: 'NODE_ENV' /* This won't be overwritten by default */ }),
	port: numberParam({ defaultValue: 8080 }), // Will be configurable via env-var 'PORT'
	database: {
		connectionUrl: stringParam({
			defaultValue: 'dbms://my-db-server.example.org',
			matches: /^dbms:\/\/[\w-]+(:?\.[\w-]+)*$/,
		}), // Will be configurable via env-var 'DATABASE_CONNECTION_URL' and checked if it matches the given regex
		username: stringParam({ defaultValue: null }), // Will be configurable via env-var 'DATABASE_USERNAME' and will return an error if it wasn't set
		password: stringParam({ defaultValue: null }), // Will be configurable via env-var 'DATABASE_PASSWORD' and will return an error if it wasn't set
	},
	someOptionalProp: stringParam({ defaultValue: null, optional: true }), // Will be configurable via env-var 'SOME_OPTIONAL_PROP' and can be null
	enableFeatureX: booleanParam({ defaultValue: false }), // Will be configurable via env-var 'ENABLE_FEATURE_X'
	nameValidationRegex: regexParam({ defaultValue: /\w+/ }), // Will be configurable via env-var 'NAME_VALIDATION_REGEX' and checked if it is a valid regex
})

const propertiesResult = config.getProperties() // contains either the properties or a list of errors (uses neverthrow's Result)
if (propertiesResult.isErr()) {
	// Not the best error handling, but it showcases that you'll get a list with all errors
	throw new Error(`Configuration-errors occurred: ${propertiesResult.error.map(schemaErrorToString).toString()}`)
}

// If you do not plan to use the error for further logic you can call getPropertiesOrThrow() instead
// const properties = config.getPropertiesOrThrow()

const properties = propertiesResult.value
properties.database.connectionUrl // Access the properties as you would expect; type: string
properties.someOptionalProp // type: string | null
```

### Available param types

-   `numberParam({ defaultValue: 0 })`: requires a number
-   `stringParam({ defaultValue: '' })`: requires a string that optionally matches a regex with option `matches`
-   `booleanParam({ defaultValue: false })`: requires a boolean
-   `regexParam({ defaultValue: '' })`: requires a Regular Expression
-   `param( {defaultValue: T, transformer: (val: unknown):T => {...} })`: a generic parameter where you can define the parameter type yourself

#### Custom predefined params

If you want to create a custom parameter like `numberParam` or `stringParam` you can use the function `paramUnsafe` inside your definition.
`paramUnsafe` does not unsafe to execute, but typescript cannot infer the types correctly if used in a config-schema.
To help typescript with type inference this method is wrapped.

To create your custom parameter use `numberParam` as a guideline: [./src/lib/params/number-param.ts]()

### Config options

This library provides some additional options:

```typescript
const options: ConfigOptions = {
	/**
	 * Adds MY_PREFIX as prefix of every generated env.
	 * In the example above the config 'port' would be configurable via 'MY_PREFIX_PORT'.
	 * default: no prefix
	 */
	envPrefix: 'MY_PREFIX',
	/**
	 * Apply the envPrefix to existing env entries if true.
	 * In the example above the config 'env' would be 'MY_PREFIX_NODE_ENV'
	 * default: false
	 */
	prefixExistingEnv: true,
	/**
	 * Override the used environment eg. in tests
	 *
	 * default: process.env
	 */
	env: {...}
}
```
