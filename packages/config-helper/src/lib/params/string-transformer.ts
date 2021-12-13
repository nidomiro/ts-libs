import { ConfigValueTransformer } from '../schema'
import { NotConvertable } from '../schema.error'
import { err, ok } from 'neverthrow'

function checkString(val: string, matches?: RegExp) {
	if (matches != null) {
		if (val.match(matches)) {
			return ok(val)
		} else {
			return err(NotConvertable)
		}
	} else {
		return ok(val)
	}
}

export function stringTransformer(matches?: RegExp): ConfigValueTransformer<string> {
	return (val) => {
		if (val === null) {
			return ok(null)
		} else if (typeof val === 'string') {
			return checkString(val, matches)
		} else {
			return err(NotConvertable)
		}
	}
}
