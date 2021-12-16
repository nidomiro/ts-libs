import { SchemaError, schemaErrorToString } from './schema.error'

export class ConfigError extends Error {
	constructor(public readonly errors: SchemaError[]) {
		super()
	}

	public toString(): string {
		let errorsAsString = ``
		if (this.errors.length !== 0) {
			errorsAsString = `\n` + this.errors.map((x) => `\t` + schemaErrorToString(x) + `,\n`).join('')
		}
		return `ConfigError: {"errors": [${errorsAsString}]}`
	}
}
