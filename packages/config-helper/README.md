# @nidomiro/config-helper

This library is a wrapper around [node-convict](https://github.com/mozilla/node-convict) which adds default values for env-vars according to its prop-path.

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

Basically you can use config-helper like node-convict, and it does its "magic" in the background to make your life easier.

Example:
```typescript
import { createConfig } from '@nidomiro/config-helper';

const config = createConfig({
	env: {
		doc: 'The application environment.',
		format: ['production', 'development', 'test'],
		default: 'production',
		env: 'NODE_ENV' // This won't be overwritten
	},
	port: { // Will also be configurable via env-var 'PORT'
		doc: 'The port to bind.',
		format: 'port',
		default: 8080,
		arg: 'port'
	},
	database: {
		connectionUrl: { // Will also be configurable via env-var 'DATABASE_CONNECTION_URL'
			format: String,
			default: 'my-db-server.example.org'
		},
		username: { // Will also be configurable via env-var 'DATABASE_USERNAME'
			format: String,
			default: 'my-secure-username'
		},
		password: { // Will also be configurable via env-var 'DATABASE_PASSWORD'
			format: String,
			default: null
		}
	},

});
```

If you want to more information, you can head over to: https://github.com/mozilla/node-convict/tree/master/packages/convict#usage
