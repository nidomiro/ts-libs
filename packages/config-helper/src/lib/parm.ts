import { MustHaveNull } from './util';
import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from './schema';

// eslint-disable-next-line @typescript-eslint/ban-types
export function param<T extends {} | null>(
	transformer: (val: unknown | null) => MustHaveNull<T>,
	config: { optional: true; envVar?: string }
): ConfigDefinitionOptional<MustHaveNull<T>>;
// eslint-disable-next-line @typescript-eslint/ban-types
export function param<T extends null extends T ? never : {}>(
	transformer: (val: unknown | null) => T | null,
	config?: { optional?: false; envVar?: string }
): null extends T ? never : ConfigDefinitionRequired<T>;
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
