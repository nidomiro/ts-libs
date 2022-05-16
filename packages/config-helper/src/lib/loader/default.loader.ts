import { Loader, LoaderConfigDefDefault } from './loader'
import { ok } from 'neverthrow'

export const defaultLoader: Loader = <T>(environment: NodeJS.ProcessEnv, configDef: LoaderConfigDefDefault<T>) => {
	return ok(configDef.defaultValue)
}
