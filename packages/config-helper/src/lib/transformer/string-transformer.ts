export function stringTransformer(defaultValue?: string | null): (val: unknown | null) => string | null {
	return (val) => {
		if (val != null && typeof val === 'string') {
			return val;
		} else {
			return defaultValue ?? null;
		}
	};
}
