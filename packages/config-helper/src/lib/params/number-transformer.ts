import { ConfigValueTransformer } from '../schema'
import { NotConvertable } from '../schema.error'
import { err, ok, Result } from 'neverthrow'

function handleString(val: string): Result<number | null, typeof NotConvertable> {
	if (val.trim().length === 0) {
		return ok(null)
	}

	const converted = Number(val)
	if (isNaN(converted)) {
		return err(NotConvertable)
	} else {
		return ok(converted)
	}
}

export function numberTransformer(): ConfigValueTransformer<number> {
	return (val) => {
		if (val === null) {
			return ok(null)
		} else if (typeof val === 'string') {
			return handleString(val)
		} else if (typeof val === 'number') {
			return ok(val)
		} else {
			return err(NotConvertable)
		}
	}
}
