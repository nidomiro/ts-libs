import { ConfigHelperError, configHelperErrorToString } from './config-helper.error'

function configErrorToString(errors: ConfigHelperError[]) {
	let errorsAsString = ``
	if (errors.length !== 0) {
		errorsAsString = `\n` + errors.map((x) => `\t` + configHelperErrorToString(x) + `,\n`).join('')
	}
	return `ConfigError: {"errors": [${errorsAsString}]}`
}

export class ConfigError extends Error {
	constructor(public readonly errors: ConfigHelperError[]) {
		super(configErrorToString(errors))
	}

	public toString(): string {
		return configErrorToString(this.errors)
	}
}
