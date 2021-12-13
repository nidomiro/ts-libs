import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from '../schema'
import { OptionalParam, paramUnsafe, RequiredParam } from '../parm'
import { regexTransformer } from './regex-transformer'

interface RegexParam {
	regex: RegExp
}

export function regexParam(
	def: Omit<OptionalParam<string>, 'transformer'> & RegexParam,
): ConfigDefinitionOptional<string>
export function regexParam(
	def: Omit<RequiredParam<string>, 'transformer'> & RegexParam,
): ConfigDefinitionRequired<string>
export function regexParam(
	def:
		| (Omit<RequiredParam<string>, 'transformer'> & RegexParam)
		| Omit<OptionalParam<string> & RegexParam, 'transformer'>,
): ConfigDefinition<string> | ConfigDefinitionRequired<string> {
	return paramUnsafe({
		...def,
		transformer: regexTransformer(def.regex),
	})
}
