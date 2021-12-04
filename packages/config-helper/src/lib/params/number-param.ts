import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from '../schema'
import { OptionalParam, paramUnsafe, RequiredParam } from '../parm'
import { numberTransformer } from './number-transformer'

export function numberParam(def: Omit<OptionalParam<number>, 'transformer'>): ConfigDefinitionOptional<number>
export function numberParam(def: Omit<RequiredParam<number>, 'transformer'>): ConfigDefinitionRequired<number>
export function numberParam(
	def: Omit<RequiredParam<number>, 'transformer'> | Omit<OptionalParam<number>, 'transformer'>,
): ConfigDefinition<number> | ConfigDefinitionRequired<number> {
	return paramUnsafe({
		...def,
		transformer: numberTransformer(),
	})
}
