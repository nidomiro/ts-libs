import { ok } from 'neverthrow'
import { NoValue } from '../schema'
import { trimString } from '../utils/string-util'
import { Loader, LoaderConfigDef } from './loader'

const loadEnvVar = <T>(environment: NodeJS.ProcessEnv, key: string, trimValue: LoaderConfigDef<T>['trimValue']) => {
	const value = environment[key]
	if (value == null) {
		return NoValue
	} else {
		const trimmedValue = trimString(value, trimValue)
		if (trimmedValue.length === 0) {
			return NoValue
		} else {
			return trimmedValue
		}
	}
}

export const envVarLoader: Loader = <T>(environment: NodeJS.ProcessEnv, configDef: LoaderConfigDef<T>) => {
	const envVars = [configDef.envVar, ...configDef.altEnvVars]
	return ok(
		envVars.reduce<string | typeof NoValue>((result, currentValue) => {
			if (result !== NoValue) {
				return result
			}
			return loadEnvVar(environment, currentValue, configDef.trimValue)
		}, NoValue),
	)
}
