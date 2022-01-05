import { ConfigHelperError, configHelperErrorToString } from './config-helper.error'

export class ConfigError extends Error {
	constructor(public readonly errors: ConfigHelperError[]) {
		super()
	}

	public toString(): string {
		let errorsAsString = ``
		if (this.errors.length !== 0) {
			errorsAsString = `\n` + this.errors.map((x) => `\t` + configHelperErrorToString(x) + `,\n`).join('')
		}
		return `ConfigError: {"errors": [${errorsAsString}]}`
	}
}
