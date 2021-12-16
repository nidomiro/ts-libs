import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from '../schema'
import { OptionalParam, paramUnsafe, RequiredParam } from '../parm'
import { numberTransformer } from './number-transformer'

export function numberParam(
	def: Omit<OptionalParam<number>, 'transformer' | 'trimValue'>,
): ConfigDefinitionOptional<number>
export function numberParam(
	def: Omit<RequiredParam<number>, 'transformer' | 'trimValue'>,
): ConfigDefinitionRequired<number>
export function numberParam(
	def:
		| Omit<RequiredParam<number>, 'transformer' | 'trimValue'>
		| Omit<OptionalParam<number>, 'transformer' | 'trimValue'>,
): ConfigDefinition<number> | ConfigDefinitionRequired<number> {
	return paramUnsafe({
		...def,
		transformer: numberTransformer(),
		trimValue: true,
	})
}
