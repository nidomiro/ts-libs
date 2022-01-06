import { ConfigDefinition, ConfigDefinitionCommon } from './schema'

export interface NormalizedConfigDefinition<T> extends Required<ConfigDefinitionCommon<T>> {
	optional: boolean
}

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type NormalizeSchema<T> = {
	[P in keyof T]: T[P] extends ConfigDefinition<unknown> ? NormalizedConfigDefinition<T[P]> : NormalizeSchema<T[P]>
}

export function isNormalizedSchemaObject<T>(
	x: NormalizeSchema<unknown> | NormalizedConfigDefinition<T>,
): x is NormalizedConfigDefinition<T> {
	return 'envVar' in x && 'trimValue' in x
}
