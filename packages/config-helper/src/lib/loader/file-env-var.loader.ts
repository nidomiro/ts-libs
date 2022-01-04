import { err, ok } from 'neverthrow'
import { NoValue } from '../schema'
import { NormalizedConfigDefinition } from '../normalized-schema'
import { trimString } from '../utils/string-util'
import { Loader } from './loader'
import * as fs from 'fs'
import { ConfigParseError } from '../config-parse.error'
import { NotConvertable } from '../schema.error'

export const fileEnvVarLoader: Loader = <T>(
	environment: NodeJS.ProcessEnv,
	configDef: NormalizedConfigDefinition<T>,
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
			return err({
				//FIXME: replace with error that makes more sense here
				errorType: NotConvertable,
				propertyPath: [],
				inputValue: valueFilePath,
				cause: e,
			} as ConfigParseError)
		}
	}
}
