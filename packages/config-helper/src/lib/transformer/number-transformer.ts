
function handleString(val: string): number | null {
	if(val.trim().length === 0) {
		return null
	}

	const converted = Number(val)
	if(isNaN(converted)) {
		throw new TypeError(`'${val}' could not be converted to a number`) // TODO: maybe use neverthrow or a special return value to let the ConfigImpl add more context to the error
	} else {
		return converted
	}
}


export function numberTransformer(defaultValue?: number | null): (val: unknown | null) => number | null {
	return (val) => {
		if (val == null)  {
			return defaultValue ?? null
		} else if (typeof val === 'string') {
			return handleString(val)
		} else if (typeof val === 'number') {
			return val;
		} else {
			throw new TypeError(`got '${typeof val}' instead of 'string'`)
		}
	};
}
