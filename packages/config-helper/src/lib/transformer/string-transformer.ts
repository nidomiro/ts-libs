export function stringTransformer(defaultValue?: string | null): (val: unknown | null) => string | null {
	return (val) => {
		if (val == null ) {
			return defaultValue ?? null
		}else if (typeof val === 'string') {
			return val;
		} else {
			throw new TypeError(`got '${typeof val}' instead of 'string'`)
		}
	};
}
