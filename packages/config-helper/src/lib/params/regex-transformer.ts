import { ConfigValueTransformer } from '../schema'
import { NotConvertable } from '../schema.error'
import { err, ok, Result } from 'neverthrow'

function validateRegex(regex: RegExp, value: string): Result<string | null, typeof NotConvertable> {
	if (value.match(regex)) {
		return ok(value)
	} else {
		return err(NotConvertable)
	}
}

export function regexTransformer(regex: RegExp): ConfigValueTransformer<string> {
	return (val) => {
		if (val === null) {
			return ok(null)
		} else if (typeof val === 'string') {
			return validateRegex(regex, val)
		} else {
			return err(NotConvertable)
		}
	}
}
