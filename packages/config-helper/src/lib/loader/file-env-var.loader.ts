import { err, ok } from 'neverthrow'
import { NoValue } from '../schema'
import { NormalizedConfigDefinition } from '../normalized-schema'
import { trimString } from '../utils/string-util'
import { Loader } from './loader'
import * as fs from 'fs'
import { ConfigParseError } from '../config-parse.error'
import { FileNotFound, FilePermissionError, NotLoadable } from './symbols'
import { isNonNilObject } from '../utils/object-util'

export const fileEnvVarLoader: Loader = <T>(
	environment: NodeJS.ProcessEnv,
	configDef: NormalizedConfigDefinition<T>,
	propertyPath: string[],
) => {
	const valueFilePath = environment[`${configDef.envVar}_FILE`]
	if (valueFilePath == null) {
		return ok(NoValue)
	} else {
		try {
			const value = fs.readFileSync(valueFilePath.trim(), 'utf8')
			const trimmedValue = trimString(value, configDef.trimValue)
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
}
