import { err, ok, Result } from 'neverthrow'
import { NoValue } from '../schema'
import { trimString } from '../utils/string-util'
import { Loader, LoaderConfigDef } from './loader'
import * as fs from 'fs'
import { ConfigParseError } from '../config-parse.error'
import { FileNotFound, FilePermissionError, NotLoadable } from './symbols'
import { isNonNilObject } from '../utils/object-util'

const loadFileEnvVar = <T>(
	environment: NodeJS.ProcessEnv,
	envVarKey: string,
	trimValue: LoaderConfigDef<T>['trimValue'],
	propertyPath: string[],
) => {
	const valueFilePath = environment[`${envVarKey}_FILE`]
	if (valueFilePath == null) {
		return ok(NoValue)
	}

	try {
		const value = fs.readFileSync(valueFilePath.trim(), 'utf8')
		const trimmedValue = trimString(value, trimValue)
		if (trimmedValue.length === 0) {
			return ok(NoValue)
		} else {
			return ok(trimmedValue)
		}
	} catch (e: unknown) {
		if (isNonNilObject(e) && e['code'] === 'ENOENT') {
			return err({
				errorType: FileNotFound,
				propertyPath,
				filePath: valueFilePath,
				cause: e,
			} as ConfigParseError)
		} else if (isNonNilObject(e) && e['code'] === 'EACCES') {
			return err({
				errorType: FilePermissionError,
				propertyPath,
				filePath: valueFilePath,
				cause: e,
			} as ConfigParseError)
		} else {
			return err({
				errorType: NotLoadable,
				propertyPath,
				filePath: valueFilePath,
				cause: e,
			} as ConfigParseError)
		}
	}
}

export const fileEnvVarLoader: Loader = <T>(
	environment: NodeJS.ProcessEnv,
	configDef: LoaderConfigDef<T>,
	propertyPath: string[],
) => {
	const envVars = [configDef.envVar, ...configDef.altEnvVars]
	return envVars.reduce<Result<string | typeof NoValue, ConfigParseError>>((result, currentValue) => {
		if ((result.isOk() && result.value !== NoValue) || result.isErr()) {
			return result
		}
		return loadFileEnvVar(environment, currentValue, configDef.trimValue, propertyPath)
	}, ok(NoValue))
}
