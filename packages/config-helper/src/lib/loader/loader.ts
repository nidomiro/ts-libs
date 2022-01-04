import { Result } from 'neverthrow'
import { NoValue } from '../schema'
import { ConfigParseError } from '../config-parse.error'
import { NormalizedConfigDefinition } from '@nidomiro/config-helper'

export type Loader = <T>(
	environment: NodeJS.ProcessEnv,
	configDef: NormalizedConfigDefinition<T>,
) => Result<T | string | null | typeof NoValue, ConfigParseError>
