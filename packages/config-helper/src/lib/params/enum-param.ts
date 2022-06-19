import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from '../schema'
import { OptionalParam, paramUnsafe, RequiredParam } from '../parm'
import { enumTransformer } from './enum-transformer'

interface AdditionalEnumProps<T> {
	possibleValues: T[]
	/**
	 * default: true
	 */
	matchCaseInsensitive?: boolean
}

export function enumParam<T extends string>(
	def: Omit<OptionalParam<T>, 'transformer' | 'trimValue'> & AdditionalEnumProps<T>,
): ConfigDefinitionOptional<T>
export function enumParam<T extends string>(
	def: Omit<RequiredParam<T>, 'transformer' | 'trimValue'> & AdditionalEnumProps<T>,
): ConfigDefinitionRequired<T>

export function enumParam<T extends string>(
	def:
		| (Omit<RequiredParam<T>, 'transformer' | 'trimValue'> & AdditionalEnumProps<T>)
		| (Omit<OptionalParam<T>, 'transformer' | 'trimValue'> & AdditionalEnumProps<T>),
): ConfigDefinition<T> | ConfigDefinitionRequired<T> {
	return paramUnsafe({
		...def,
		transformer: enumTransformer<T>(def.possibleValues, def.matchCaseInsensitive ?? true),
		trimValue: true,
	})
}
