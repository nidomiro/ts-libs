// eslint-disable-next-line @typescript-eslint/ban-types
export interface Lazy<T extends {} | null> {
	value: T

	reset: () => void
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class LazyImpl<T extends {} | null> implements Lazy<T> {
	public get value(): T {
		if (this._value === undefined) {
			this._value = this._initializer()
		}
		return this._value
	}

	private _value: T | undefined = undefined

	constructor(private readonly _initializer: () => T) {}

	public reset(): void {
		this._value = undefined
	}
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function lazy<T extends {} | null>(initializer: () => T): Lazy<T> {
	return new LazyImpl<T>(initializer)
}
