
// eslint-disable-next-line @typescript-eslint/ban-types
export class Lazy<T extends {} | null> {

	public get value(): T {
		if(this._value === undefined) {
			this._value = this._initializer()
		}
		return this._value
	}

	private _value: T | undefined = undefined

	constructor(private readonly _initializer: () => T) {}

}

// eslint-disable-next-line @typescript-eslint/ban-types
export function lazy<T extends {} | null>( initializer: () => T ): Lazy<T> {
	return new Lazy<T>(initializer)
}
