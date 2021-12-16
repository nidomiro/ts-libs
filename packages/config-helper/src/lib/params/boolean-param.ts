import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from '../schema'
import { OptionalParam, paramUnsafe, RequiredParam } from '../parm'
import { booleanTransformer } from './boolean-transformer'

export function booleanParam(
	def: Omit<OptionalParam<boolean>, 'transformer' | 'trimValue'>,
): ConfigDefinitionOptional<boolean>
export function booleanParam(
	def: Omit<RequiredParam<boolean>, 'transformer' | 'trimValue'>,
): ConfigDefinitionRequired<boolean>
export function booleanParam(
	def: Omit<RequiredParam<boolean>, 'transformer' | 'trimValue'> | Omit<OptionalParam<boolean>, 'transformer'>,
): ConfigDefinition<boolean> | ConfigDefinitionRequired<boolean> {
	return paramUnsafe({
		...def,
		transformer: booleanTransformer(),
		trimValue: true,
	})
}
