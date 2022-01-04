export interface ConfigHelperError {
	errorType: symbol
	cause?: unknown
	// eslint-disable-next-line @typescript-eslint/member-ordering
	[x: string]: unknown
}

export function configHelperErrorToString(error: ConfigHelperError): string {
	// eslint-disable-next-line @typescript-eslint/promise-function-async
	return JSON.stringify(error, (key: unknown, value: unknown) =>
		typeof value == 'symbol' ? value.toString() : value,
	)
}
