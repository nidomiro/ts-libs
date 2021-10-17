import * as convict from 'convict';
import { constantCase } from 'change-case';
import { SchemaObj } from 'convict';

// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
const CONVICT_FORMAT_WITH_VALIDATOR = require('convict-format-with-validator');
convict.addFormats(CONVICT_FORMAT_WITH_VALIDATOR);

function isSchemaObject<T>(x: convict.Schema<T> | SchemaObj<T>): x is SchemaObj<T> {
	return 'default' in x
}

function addEnv<T>(schema: convict.Schema<T>, opts?: ConfigOptions ): convict.Schema<T> {

	let prefix = ''
	if(opts?.envPrefix != null && opts.envPrefix.trim().length > 0) {
		prefix = `${opts.envPrefix}_`
	}

	let existingEnvPrefix = ''
	if(opts?.prefixExistingEnv ?? false) {
		existingEnvPrefix = prefix
	}

	function iterate(currentObject: convict.Schema<T>, currentPath: string[]): convict.Schema<T> {

		if(isSchemaObject(currentObject)) {
			const hasEnv = 'env' in currentObject;
			if(hasEnv && currentObject.env != undefined) {
				return {
					...currentObject,
					env: existingEnvPrefix + currentObject.env
				}
			} else {
				return {
					...currentObject,
					env: prefix + constantCase(currentPath.join('_')),
				};
			}
		} else {
			const alteredObjects: Array<convict.Schema<T>> = Object.entries(currentObject).map((entry) => {
				const [key, value] = entry;
				let newVal = value;
				if (typeof value === 'object' && value != null) {
					newVal = iterate(value as convict.Schema<T>, [...currentPath, key]);
				}
				return {
					[key]: newVal,
				} as convict.Schema<T>;
			});
			return Object.assign({}, ...alteredObjects) as convict.Schema<T>;
		}
	}

	return iterate(schema, []);
}

interface ConfigOptions extends convict.Options {
	/**
	 * Adds the given string as prefix of every generated env.
	 *
	 * default: no prefix
	 */
	envPrefix?: string
	/**
	 * Apply the envPrefix to existing env entries if true.
	 *
	 * default: false
	 */
	prefixExistingEnv?: boolean
}

export function createConfig<T>(schema: convict.Schema<T>, opts?: ConfigOptions): convict.Config<T> {
	return convict(addEnv(schema, opts), opts);
}
