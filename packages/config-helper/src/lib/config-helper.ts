import { constantCase } from 'change-case';
import { Schema } from "./schema";
import { NormalizedSchema } from "./normalized-schema";




interface Config<T> {

	getSchema(): NormalizedSchema<T>

}




// function isSchemaObject<T>(x: Schema<T> | SchemaObj<T>): x is SchemaObj<T> {
// 	return 'default' in x
// }
//
// function addEnv<T>(schema: Schema<T>, opts?: ConfigOptions ): Schema<T> {
//
// 	let prefix = ''
// 	if(opts?.envPrefix != null && opts.envPrefix.trim().length > 0) {
// 		prefix = `${opts.envPrefix}_`
// 	}
//
// 	let existingEnvPrefix = ''
// 	if(opts?.prefixExistingEnv ?? false) {
// 		existingEnvPrefix = prefix
// 	}
//
// 	function iterate(currentObject: Schema<T>, currentPath: string[]): Schema<T> {
//
// 		if(isSchemaObject(currentObject)) {
// 			const hasEnv = 'env' in currentObject;
// 			if(hasEnv && currentObject.env != undefined) {
// 				return {
// 					...currentObject,
// 					env: existingEnvPrefix + currentObject.env
// 				}
// 			} else {
// 				return {
// 					...currentObject,
// 					env: prefix + constantCase(currentPath.join('_')),
// 				};
// 			}
// 		} else {
// 			const alteredObjects: Array<Schema<T>> = Object.entries(currentObject).map((entry) => {
// 				const [key, value] = entry;
// 				let newVal = value;
// 				if (typeof value === 'object' && value != null) {
// 					newVal = iterate(value as Schema<T>, [...currentPath, key]);
// 				}
// 				return {
// 					[key]: newVal,
// 				} as Schema<T>;
// 			});
// 			return Object.assign({}, ...alteredObjects) as Schema<T>;
// 		}
// 	}
//
// 	return iterate(schema, []);
// }
//
interface ConfigOptions {
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

	/**
	 * Override the used environment
	 *
	 * default: process.env
	 */
	env?: NodeJS.ProcessEnv | undefined;
}

export function createConfig<T>(schema: Schema<T>, opts?: ConfigOptions): Config<T> {
	// return convict(addEnv(schema, opts), opts);
}
