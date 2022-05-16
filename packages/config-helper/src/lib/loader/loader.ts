import { Result } from 'neverthrow'
import { NoValue } from '../schema'
import { ConfigParseError } from '../config-parse.error'
import { NormalizedConfigDefinition } from '../normalized-schema'

export interface LoaderConfigDef<T> extends Pick<NormalizedConfigDefinition<T>, 'envVar' | 'trimValue'> {}
export interface LoaderConfigDefDefault<T> extends Pick<NormalizedConfigDefinition<T>, 'defaultValue'> {}

export type Loader = <T>(
	environment: NodeJS.ProcessEnv,
	configDef: LoaderConfigDef<T> & LoaderConfigDefDefault<T>,
	propertyPath: string[],
) => Result<T | string | null | typeof NoValue, ConfigParseError>
