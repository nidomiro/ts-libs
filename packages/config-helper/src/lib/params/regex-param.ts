import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from '../schema'
import { OptionalParam, paramUnsafe, RequiredParam } from '../parm'
import { regexTransformer } from './regex-transformer'

export function regexParam(
	def: Omit<OptionalParam<RegExp>, 'transformer' | 'trimValue'>,
): ConfigDefinitionOptional<RegExp>
export function regexParam(
	def: Omit<RequiredParam<RegExp>, 'transformer' | 'trimValue'>,
): ConfigDefinitionRequired<RegExp>
export function regexParam(
	def:
		| Omit<RequiredParam<RegExp>, 'transformer' | 'trimValue'>
		| Omit<OptionalParam<RegExp>, 'transformer' | 'trimValue'>,
): ConfigDefinition<RegExp> | ConfigDefinitionRequired<RegExp> {
	return paramUnsafe({
		...def,
		transformer: regexTransformer(),
		trimValue: true,
	})
}
