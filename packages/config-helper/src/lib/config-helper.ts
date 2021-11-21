import { constantCase } from 'change-case';
import { CSchema, isSchemaObject, Schema, SchemaObj } from "./schema";
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
export function createCConfig<T >(schema: CSchema<T>, opts?: ConfigOptions): Config<T> {

	return new ConfigDefaultImpl(schema, opts)
}


interface ConfigGroup<T> {}



interface ConfigDefinitionCommon<T> {
	transformer: (val: unknown) => T;
	default: T | undefined;
	envVar?: string;
}

interface ConfigDefinitionOptional<T> extends ConfigDefinitionCommon<T> {
	optional: false
}
interface ConfigDefinitionRequired<T> extends ConfigDefinitionCommon<T>{
	optional: true
}

type GroupContentDef<T> = {
[P in keyof T]: ConfigDefinitionOptional<T[P]> | ConfigDefinitionRequired<T[P]>
}

export function cc<TSchema>(schema: GroupContentDef<TSchema>): TSchema {

}

type MustHaveNull<T> = null extends T ? T : never

export function configDef<T extends {} | null>(def:{transformer: (val: unknown) => MustHaveNull<T>, optional: true, envVar?: string}): ConfigDefinitionOptional<T>
export function configDef<T extends (null extends T ? never: {})>(def:{transformer: (val: unknown) => T | null, optional?: false, envVar?: string}): null extends T ? never : ConfigDefinitionRequired<T>
export function configDef<T>(def:{transformer: (val: unknown) => T, optional?: boolean, envVar?: string}): ConfigDefinitionOptional<T> | ConfigDefinitionRequired<T> {

}

const a = cc({
	explicitOptionalProp: configDef<string | null>({transformer: () => 'firstValue', optional: true}),
	explicitFunctionOptionalProp: configDef({transformer: (): string| null => 'firstValue', optional: true}),
	errorBecauseOfMissingNull: configDef({transformer: () => 'firstValue', optional: true}),
	secondProp: configDef({transformer: () => null, optional: false}),
	thirdProp: configDef({transformer: () => 'thirdValue'}),
})

const sP = a.secondProp

