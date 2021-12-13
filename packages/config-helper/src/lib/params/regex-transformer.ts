import { ConfigValueTransformer } from '../schema'
import { NotConvertable } from '../schema.error'
import { err, ok, Result } from 'neverthrow'

function validateRegex(value: string): Result<RegExp | null, typeof NotConvertable> {
	try {
		return ok(new RegExp(value))
	} catch {
		return err(NotConvertable)
	}
}

export function regexTransformer(): ConfigValueTransformer<RegExp> {
	return (val) => {
		if (val === null) {
			return ok(null)
		} else if (typeof val === 'object' && val instanceof RegExp) {
			return ok(val)
		} else if (typeof val === 'string') {
			return validateRegex(val)
		} else {
			return err(NotConvertable)
		}
	}
}
