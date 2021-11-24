import {
	ConfigDefinition,
	ConfigDefinitionCommon,
	ConfigDefinitionOptional,
	ConfigDefinitionRequired,
} from './schema'

interface ParamCommon<T> extends ConfigDefinitionCommon<T> {
	trimValue?: boolean | 'start' | 'end'
}

interface RequiredParam<T> extends ParamCommon<T> {
	optional?: false
}

interface OptionalParam<T> extends ParamCommon<T> {
	optional: true
}

export function param<T>(def: OptionalParam<T>): ConfigDefinitionOptional<T>
export function param<T>(def: RequiredParam<T>): ConfigDefinitionRequired<T>
export function param<T>(def: RequiredParam<T> | OptionalParam<T>): ConfigDefinition<T> | ConfigDefinitionRequired<T> {
	return {
		...def,
		optional: def.optional ?? false,
	}
}
