import { ConfigValueTransformer } from '../schema'

function handleString(val: string, handleEmptyStringAsNull: boolean): string | null {
	if (handleEmptyStringAsNull && val.trim().length === 0) {
		return null
	}
	return val
}

export function stringTransformer(
	defaultValue: string | null = null,
	handleEmptyStringAsNull: boolean = true,
): ConfigValueTransformer<string> {
	return (val) => {
		if (val === null) {
			return null
		} else if (val === undefined) {
			return defaultValue ?? null
		} else if (typeof val === 'string') {
			return handleString(val, handleEmptyStringAsNull)
		} else {
			throw new TypeError(`got '${typeof val}' instead of 'string'`)
		}
	}
}
