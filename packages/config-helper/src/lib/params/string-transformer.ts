import { ConfigValueTransformer } from '../schema'
import { NotConvertable } from '../schema.error'
import { err, ok } from 'neverthrow'

export function stringTransformer(): ConfigValueTransformer<string> {
	return (val) => {
		if (val === null) {
			return ok(null)
		} else if (typeof val === 'string') {
			return ok(val)
		} else {
			return err(NotConvertable)
		}
	}
}
