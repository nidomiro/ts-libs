import { ConfigValueTransformer } from '../schema'
import { NotConvertable } from '../schema.error'
import { err, ok } from 'neverthrow'

const normalizeValue = (val: string, toLowercase: boolean) => {
	if (toLowercase) {
		return val.toLowerCase()
	}
	return val
}

export function enumTransformer<T extends string>(
	possibleValues: T[],
	matchCaseInsensitive: boolean,
): ConfigValueTransformer<T> {
	return (val) => {
		if (val == null) {
			return ok(null)
		} else if (typeof val === 'string') {
			const match = possibleValues.find(
				(x) => normalizeValue(x, matchCaseInsensitive) === normalizeValue(val, matchCaseInsensitive),
			)
			if (match != null) {
				return ok(match)
			} else {
				return err(NotConvertable)
			}
		} else {
			return err(NotConvertable)
		}
	}
}
