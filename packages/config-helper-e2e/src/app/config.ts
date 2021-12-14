/* eslint-disable @typescript-eslint/no-magic-numbers */
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
