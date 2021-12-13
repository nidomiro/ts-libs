import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from '../schema'
import { OptionalParam, paramUnsafe, RequiredParam } from '../parm'
import { regexTransformer } from './regex-transformer'

export function regexParam(def: Omit<OptionalParam<RegExp>, 'transformer'>): ConfigDefinitionOptional<RegExp>
export function regexParam(def: Omit<RequiredParam<RegExp>, 'transformer'>): ConfigDefinitionRequired<RegExp>
export function regexParam(
	def: Omit<RequiredParam<RegExp>, 'transformer'> | Omit<OptionalParam<RegExp>, 'transformer'>,
): ConfigDefinition<RegExp> | ConfigDefinitionRequired<RegExp> {
	return paramUnsafe({
		...def,
		transformer: regexTransformer(),
	})
}
