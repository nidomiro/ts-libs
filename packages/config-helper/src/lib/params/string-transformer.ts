import { ConfigValueTransformer } from '../schema'

export function stringTransformer(): ConfigValueTransformer<string> {
	return (val) => {
		if (val === null) {
			return null
		} else if (typeof val === 'string') {
			return val
		} else {
			throw new TypeError(`got '${typeof val}' instead of 'string'`)
		}
	}
}
