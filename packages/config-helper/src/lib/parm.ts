import { ConfigDefinition, ConfigDefinitionCommon, ConfigDefinitionOptional, ConfigDefinitionRequired } from './schema'

export interface ParamCommon<T> extends ConfigDefinitionCommon<T> {}

export interface RequiredParam<T> extends ParamCommon<T> {
	optional?: false
}

export interface OptionalParam<T> extends ParamCommon<T> {
	optional: true
}

/**
 * This method is "unsafe" because the types are often inferred incorrectly.
 * It's meant to be called from a custom param.
 * If you want to use it in a config-schema-definition you have to provide the first generic type or use `param` instead
 * @param def
 */
export function paramUnsafe<
	T,
	TParam extends RequiredParam<T> | OptionalParam<T> = RequiredParam<T> | OptionalParam<T>,
>(def: TParam): OptionalParam<T> extends TParam ? ConfigDefinitionOptional<T> : ConfigDefinitionRequired<T> {
	// noinspection UnnecessaryLocalVariableJS
	const retVal: ConfigDefinition<T> = {
		...def,
		optional: def.optional ?? false,
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	return retVal
}

export function param<T>(def: OptionalParam<T>): ConfigDefinitionOptional<T>
export function param<T>(def: RequiredParam<T>): ConfigDefinitionRequired<T>
export function param<T>(def: RequiredParam<T> | OptionalParam<T>): ConfigDefinition<T> {
	return paramUnsafe(def)
}
