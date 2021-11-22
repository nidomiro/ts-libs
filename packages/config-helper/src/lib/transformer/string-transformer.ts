
function handleString(val: string, handleEmptyStringAsNull: boolean): string | null {
	if(handleEmptyStringAsNull && val.trim().length === 0) {
		return null
	}
	return val
}


export function stringTransformer(defaultValue: string | null = null, handleEmptyStringAsNull: boolean = false): (val: unknown | null) => string | null {
	return (val) => {
		if (val == null ) {
			return defaultValue ?? null
		}else if (typeof val === 'string') {

			return handleString(val, handleEmptyStringAsNull);
		} else {
			throw new TypeError(`got '${typeof val}' instead of 'string'`)
		}
	};
}
