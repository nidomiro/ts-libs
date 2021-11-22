import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from './schema';

export function param<T>(
	transformer: (val: unknown | null) => T | null,
	config: { optional: true; envVar?: string }
): ConfigDefinitionOptional<T>;
export function param<T>(
	transformer: (val: unknown | null) => T | null,
	config?: { optional?: false; envVar?: string }
): ConfigDefinitionRequired<T>;
export function param<T>(
	transformer: (val: unknown | null) => T,
	config?: { optional?: boolean; envVar?: string }
): ConfigDefinition<T> | ConfigDefinitionRequired<T> {
	return {
		transformer,
		optional: config?.optional ?? false,
		envVar: config?.envVar,
	};
}
