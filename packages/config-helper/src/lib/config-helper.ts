import { constantCase } from 'change-case';
import { isSchemaObject, Schema, SchemaObj } from "./schema";
import { Config } from "./config";
import { ConfigOptions } from './config-options';
import { NormalizedSchema, NormalizedSchemaObj } from "./normalized-schema";
import { prefixStringIfDefined } from "./util";
import { ConfigDefaultImpl } from "./config-default-impl";


interface SchemaObjectNormalizeOptions {
	existingEnvPrefix: string
	envPrefix: string
	currentPath: string[]
}

export function normalizeSchemaObject<T>(obj: SchemaObj<T>, opts: SchemaObjectNormalizeOptions ): NormalizedSchemaObj<T> {
	const {existingEnvPrefix, envPrefix, currentPath} = opts

	return {
		default: obj.default,
		env: prefixStringIfDefined(existingEnvPrefix, obj.env) ?? envPrefix + constantCase(currentPath.join('_')),
		description: obj.description ?? null,
		format: obj.format ?? (() => true),
		maskValueInToString: obj.maskValueInToString ?? false,
		optional: obj.optional ?? false
	}

}



export function normalizeSchema<T>(schema: Schema<T>, opts?: ConfigOptions ): NormalizedSchema<T> {

	let envPrefix = ''
	if(opts?.envPrefix != null && opts.envPrefix.trim().length > 0) {
		envPrefix = `${opts.envPrefix}_`
	}

	let existingEnvPrefix = ''
	if(opts?.prefixExistingEnv ?? false) {
		existingEnvPrefix = envPrefix
	}

	function iterate(currentObject: Schema<T> , currentPath: string[]): NormalizedSchema<T>
	function iterate(currentObject: Schema<T> | SchemaObj<T>, currentPath: string[]): NormalizedSchema<T> | NormalizedSchemaObj<T> {

		if(isSchemaObject(currentObject)) {
			return normalizeSchemaObject(currentObject, {envPrefix, existingEnvPrefix, currentPath})
		} else {
			const alteredObjects: Array<Schema<T>> = Object.entries(currentObject).map((entry) => {
				const [key, value] = entry;
				let newVal = value;
				if (typeof value === 'object' && value != null) {
					newVal = iterate(value as Schema<T>, [...currentPath, key]);
				}
				return {
					[key]: newVal,
				} as Schema<T>;
			});
			return Object.assign({}, ...alteredObjects);
		}
	}

	return iterate(schema, []);
}


export function createConfig<T >(schema: Schema<T>, opts?: ConfigOptions): Config<T> {

	return new ConfigDefaultImpl(schema, opts)
}
