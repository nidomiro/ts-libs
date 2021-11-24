import { ConfigDefinition, ConfigValueTransformer, NoDefaultValue } from './schema'

export interface NormalizedConfigDefinition<T> {
	transformer: ConfigValueTransformer<T>
	envVar: string
	optional: boolean
	defaultValue: T | null | typeof NoDefaultValue
	trimValue: boolean | 'start' | 'end'
}

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type NormalizeSchema<T> = {
	[P in keyof T]: T[P] extends ConfigDefinition<unknown>
		? Omit<T[P], 'envVar'> & { envVar: string }
		: NormalizeSchema<T[P]>
}

export function isNormalizedSchemaObject<T>(
	x: NormalizeSchema<unknown> | NormalizedConfigDefinition<T>,
): x is NormalizedConfigDefinition<T> {
	return 'transformer' in x
}
