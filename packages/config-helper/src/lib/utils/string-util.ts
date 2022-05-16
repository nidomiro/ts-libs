export function prefixStringOrStringArrayIfDefined(prefix: string, str: string): string
export function prefixStringOrStringArrayIfDefined(prefix: string, str: string[]): string[]
export function prefixStringOrStringArrayIfDefined(prefix: string, str: null): null
export function prefixStringOrStringArrayIfDefined(prefix: string, str: undefined): undefined
export function prefixStringOrStringArrayIfDefined(
	prefix: string,
	str: string | string[] | null | undefined,
): string | string[] | null | undefined
export function prefixStringOrStringArrayIfDefined(
	prefix: string,
	str: string | string[] | null | undefined,
): string | string[] | null | undefined {
	if (Array.isArray(str)) {
		return str.map((s) => prefixStringOrStringArrayIfDefined(prefix, s))
	}
	if (str == null) {
		return str
	}
	return prefix + str
}

export function trimString(str: string, trim: boolean | 'start' | 'end'): string {
	if (trim === false) {
		return str
	} else if (trim === 'start') {
		return str.trimStart()
	} else if (trim === 'end') {
		return str.trimEnd()
	} else {
		return str.trim()
	}
}

export function isNonEmptyString(s: string | null | undefined): s is string {
	return s != null && s.trim().length > 0
}
