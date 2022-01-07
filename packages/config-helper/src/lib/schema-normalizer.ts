import { isSchemaObject, Schema, ConfigDefinition } from './schema'
import { ConfigOptions } from './config-options'
import { NormalizedConfigDefinition, NormalizeSchema } from './normalized-schema'
import { isNonEmptyString, prefixStringIfDefined } from './utils/string-util'
import { constantCase } from 'constant-case'

export interface SchemaObjectNormalizeOptions {
	existingEnvPrefix: string
	envPrefix: string
	currentPath: string[]
}

export function normalizeSchemaObject<T>(
	obj: ConfigDefinition<T>,
	opts: SchemaObjectNormalizeOptions,
): NormalizedConfigDefinition<T> {
	const { existingEnvPrefix, envPrefix, currentPath } = opts

	return {
		...obj,
		envVar: prefixStringIfDefined(existingEnvPrefix, obj.envVar) ?? envPrefix + constantCase(currentPath.join('_')),
		trimValue: obj.trimValue ?? false,
	}
}

export function normalizeSchema<TSchema extends Schema<unknown>>(
	schema: TSchema,
	opts: ConfigOptions = {},
): NormalizeSchema<TSchema> {
	const envPrefix = isNonEmptyString(opts.envPrefix) ? opts.envPrefix : ''
	const existingEnvPrefix = opts.prefixExistingEnv ?? false ? envPrefix : ''

	function iterate(currentObject: TSchema, currentPath: string[]): NormalizeSchema<TSchema>
	function iterate<TProp>(
		currentObject: TSchema | ConfigDefinition<TProp>,
		currentPath: string[],
	): NormalizeSchema<TSchema> | NormalizedConfigDefinition<TProp> {
		if (isSchemaObject(currentObject)) {
			return normalizeSchemaObject(currentObject, { envPrefix, existingEnvPrefix, currentPath })
		} else {
			const alteredObjects: Array<NormalizeSchema<TSchema>> = Object.entries(currentObject).map((entry) => {
				const [key, value] = entry
				return {
					[key]:
						typeof value === 'object' && value != null
							? iterate(value as TSchema, [...currentPath, key])
							: value,
				} as NormalizeSchema<TSchema>
			})
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return Object.assign({}, ...alteredObjects)
		}
	}

	return iterate(schema, [])
}
