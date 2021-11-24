export const NoDefaultValue: unique symbol = Symbol('NoDefaultValue')

export const NoValue: unique symbol = Symbol('NoValue')

export type ConfigValueTransformer<T> = (val: unknown | null) => T | null

export interface ConfigDefinitionCommon<T> {
	transformer: ConfigValueTransformer<T>
	defaultValue: T | null | typeof NoDefaultValue
	envVar?: string
	trimValue?: boolean | 'start' | 'end'
}

export interface ConfigDefinitionOptional<T> extends ConfigDefinitionCommon<T> {
	optional: false
}

export interface ConfigDefinitionRequired<T> extends ConfigDefinitionCommon<T> {
	optional: true
}

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type ConfigDefinition<T> = ConfigDefinitionOptional<T> | ConfigDefinitionRequired<T>

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type Schema<T> = {
	[P in keyof T]: ConfigDefinitionOptional<T[P]> | ConfigDefinitionRequired<T[P]> | Schema<T>
}

export function isSchemaObject<T>(x: Schema<unknown> | ConfigDefinition<T>): x is ConfigDefinition<T> {
	return 'transformer' in x
}
