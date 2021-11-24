import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from '../schema'
import { OptionalParam, paramUnsafe, RequiredParam } from '../parm'
import { stringTransformer } from './string-transformer'

export function stringParam(def: Omit<OptionalParam<string>, 'transformer'>): ConfigDefinitionOptional<string>
export function stringParam(def: Omit<RequiredParam<string>, 'transformer'>): ConfigDefinitionRequired<string>
export function stringParam(
	def: Omit<RequiredParam<string>, 'transformer'> | Omit<OptionalParam<string>, 'transformer'>,
): ConfigDefinition<string> | ConfigDefinitionRequired<string> {
	return paramUnsafe({
		...def,
		transformer: stringTransformer(),
	})
}
