import { Result } from 'neverthrow'
import { NoValue } from '../schema'
import { ConfigParseError } from '../config-parse.error'
import { NormalizedConfigDefinition } from '../normalized-schema'

export type Loader = <T>(
	environment: NodeJS.ProcessEnv,
	configDef: NormalizedConfigDefinition<T>,
	propertyPath: string[],
) => Result<T | string | null | typeof NoValue, ConfigParseError>
