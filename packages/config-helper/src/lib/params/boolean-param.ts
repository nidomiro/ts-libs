import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from '../schema'
import { OptionalParam, paramUnsafe, RequiredParam } from '../parm'
import { booleanTransformer } from './boolean-transformer'

export function booleanParam(def: Omit<OptionalParam<boolean>, 'transformer'>): ConfigDefinitionOptional<boolean>
export function booleanParam(def: Omit<RequiredParam<boolean>, 'transformer'>): ConfigDefinitionRequired<boolean>
export function booleanParam(
	def: Omit<RequiredParam<boolean>, 'transformer'> | Omit<OptionalParam<boolean>, 'transformer'>,
): ConfigDefinition<boolean> | ConfigDefinitionRequired<boolean> {
	return paramUnsafe({
		...def,
		transformer: booleanTransformer(),
	})
}
