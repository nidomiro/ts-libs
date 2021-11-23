
// eslint-disable-next-line @typescript-eslint/ban-types
export class Lazy<T extends {} | null> {

	public get value(): T {
		if(this._value === undefined) {
			this._value = this._initializer()
		}
		return this._value
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	private _value: T | undefined = undefined

	// eslint-disable-next-line @typescript-eslint/naming-convention
	constructor(private readonly _initializer: () => T) {}


}

// eslint-disable-next-line @typescript-eslint/ban-types
export function lazy<T extends {} | null>( initializer: () => T ): Lazy<T> {
	return new Lazy<T>(initializer)
}
