import { ok } from 'neverthrow'
import { NoValue } from '../schema'
import { NormalizedConfigDefinition } from '../normalized-schema'
import { trimString } from '../utils/string-util'
import { Loader } from './loader'

export const envVarLoader: Loader = <T>(environment: NodeJS.ProcessEnv, configDef: NormalizedConfigDefinition<T>) => {
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
