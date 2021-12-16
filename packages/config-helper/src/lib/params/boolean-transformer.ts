import { ConfigValueTransformer } from '../schema'
import { NotConvertable } from '../schema.error'
import { err, ok, Result } from 'neverthrow'

function handleString(val: string): Result<boolean | null, typeof NotConvertable> {
	if (val.length === 0) {
		return ok(null)
	}

	if (val === 'true' || val === '1') {
		return ok(true)
	} else if (val === 'false' || val === '0') {
		return ok(false)
	} else {
		return err(NotConvertable)
	}
}

export function booleanTransformer(): ConfigValueTransformer<boolean> {
	return (val) => {
		if (val === null) {
			return ok(null)
		} else if (typeof val === 'string') {
			return handleString(val)
		} else if (typeof val === 'boolean') {
			return ok(val)
		} else if (val === 1) {
			return ok(true)
		} else if (val === 0) {
			return ok(false)
		} else {
			return err(NotConvertable)
		}
	}
}
