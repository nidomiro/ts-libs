export function isNonNilObject(o: unknown): o is Record<string, unknown> {
	return typeof o === 'object' && o != null
}
