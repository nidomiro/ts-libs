import { ok } from 'neverthrow'
import { NoValue } from '../schema'
import { trimString } from '../utils/string-util'
import { Loader, LoaderConfigDef } from './loader'

export const envVarLoader: Loader = <T>(environment: NodeJS.ProcessEnv, configDef: LoaderConfigDef<T>) => {
	const value = environment[configDef.envVar]
	if (value == null) {
		return ok(NoValue)
	} else {
		const trimmedValue = trimString(value, configDef.trimValue)
		if (trimmedValue.length === 0) {
			return ok(NoValue)
		} else {
			return ok(trimmedValue)
		}
	}
}
