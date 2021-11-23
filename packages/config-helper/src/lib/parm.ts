import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired, ConfigValueTransformer } from './schema'

export function param<T>(
	transformer: ConfigValueTransformer<T>,
	config: { optional: true; envVar?: string },
): ConfigDefinitionOptional<T>
export function param<T>(
	transformer: ConfigValueTransformer<T>,
	config?: { optional?: false; envVar?: string },
): ConfigDefinitionRequired<T>
export function param<T>(
	transformer: ConfigValueTransformer<T>,
	config?: { optional?: boolean; envVar?: string },
): ConfigDefinition<T> | ConfigDefinitionRequired<T> {
	return {
		transformer,
		optional: config?.optional ?? false,
		envVar: config?.envVar,
	}
}
