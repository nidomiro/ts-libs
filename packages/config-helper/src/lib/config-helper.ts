import { constantCase } from 'change-case';
import { ConfigDefinition, isSchemaObject, Schema } from './schema';
import { Config } from './config';
import { ConfigOptions } from './config-options';
import { NormalizedConfigDefinition, NormalizeSchema } from './normalized-schema';
import { prefixStringIfDefined } from './util';
import { ConfigDefaultImpl } from './config-default-impl';

interface SchemaObjectNormalizeOptions {
	existingEnvPrefix: string;
	envPrefix: string;
	currentPath: string[];
}

export function normalizeSchemaObject<T>(
	obj: ConfigDefinition<T>,
	opts: SchemaObjectNormalizeOptions
): NormalizedConfigDefinition<T> {
	const { existingEnvPrefix, envPrefix, currentPath } = opts;

	return {
		...obj,
		envVar: prefixStringIfDefined(existingEnvPrefix, obj.envVar) ?? envPrefix + constantCase(currentPath.join('_')),
	};
}

export function normalizeSchema<TSchema extends Schema<unknown>>(
	schema: TSchema,
	opts?: ConfigOptions
): NormalizeSchema<TSchema> {
	let envPrefix = '';
	if (opts?.envPrefix != null && opts.envPrefix.trim().length > 0) {
		envPrefix = `${opts.envPrefix}_`;
	}

	let existingEnvPrefix = '';
	if (opts?.prefixExistingEnv ?? false) {
		existingEnvPrefix = envPrefix;
	}

	function iterate(currentObject: TSchema, currentPath: string[]): NormalizeSchema<TSchema>;
	function iterate<TProp>(
		currentObject: TSchema | ConfigDefinition<TProp>,
		currentPath: string[]
	): NormalizeSchema<TSchema> | NormalizedConfigDefinition<TProp> {
		if (isSchemaObject(currentObject)) {
			return normalizeSchemaObject(currentObject, { envPrefix, existingEnvPrefix, currentPath });
		} else {
			const alteredObjects: TSchema[] = Object.entries(currentObject).map((entry) => {
				const [key, value] = entry;
				let newVal = value;
				if (typeof value === 'object' && value != null) {
					newVal = iterate(value as TSchema, [...currentPath, key]);
				}
				return {
					[key]: newVal,
				} as TSchema;
			});
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return Object.assign({}, ...alteredObjects);
		}
	}

	return iterate(schema, []);
}

export function createConfig<TSchema extends Schema<unknown>>(schema: TSchema, opts?: ConfigOptions): Config<TSchema> {
	return new ConfigDefaultImpl(schema, opts);
}

// const a = cc({
// 	explicitOptionalProp: configDef<string | null>(() => 'firstValue', {optional: true}),
// 	explicitFunctionOptionalProp: configDef((): string| null => 'firstValue', {optional: true}),
// 	errorBecauseOfMissingNull: configDef(() => 'firstValue', {optional: true}),
// 	secondProp: configDef(() => null, {optional: false}),
// 	thirdProp: configDef(() => 'thirdValue'),
// })
