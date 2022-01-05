import { NormalizedConfigDefinition } from '../normalized-schema'
import { Loader } from './loader'
import { ok } from 'neverthrow'

export const defaultLoader: Loader = <T>(environment: NodeJS.ProcessEnv, configDef: NormalizedConfigDefinition<T>) => {
	return ok(configDef.defaultValue)
}
