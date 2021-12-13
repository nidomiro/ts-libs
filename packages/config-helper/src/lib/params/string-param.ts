import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from '../schema'
import { OptionalParam, paramUnsafe, RequiredParam } from '../parm'
import { stringTransformer } from './string-transformer'

interface AdditionalStringProps {
	matches?: RegExp
}

export function stringParam(
	def: Omit<OptionalParam<string>, 'transformer'> & AdditionalStringProps,
): ConfigDefinitionOptional<string>
export function stringParam(
	def: Omit<RequiredParam<string>, 'transformer'> & AdditionalStringProps,
): ConfigDefinitionRequired<string>
export function stringParam(
	def:
		| (Omit<RequiredParam<string>, 'transformer'> & AdditionalStringProps)
		| Omit<OptionalParam<string> & AdditionalStringProps, 'transformer'>,
): ConfigDefinition<string> | ConfigDefinitionRequired<string> {
	return paramUnsafe({
		...def,
		transformer: stringTransformer(def.matches),
	})
}
