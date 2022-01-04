import { NormalizeSchema } from './normalized-schema'
import { Schema } from './schema'
import { Properties } from './properties'
import { Result } from 'neverthrow'
import { ConfigHelperError } from './config-helper.error'

export interface Config<TSchema extends Schema<unknown>> {
	/**
	 * Returns the Schema effectively used by the Config
	 */
	getSchema: () => NormalizeSchema<TSchema>

	/**
	 * Returns the evaluated schema (=> Properties) or all occurred errors
	 */
	getProperties: () => Result<Properties<TSchema>, ConfigHelperError[]>

	/**
	 * Returns the evaluated schema (=> Properties) or throws a ConfigError containing all occurred errors
	 * @throws {ConfigError}
	 */
	getPropertiesOrThrow: () => Properties<TSchema>

	/**
	 * Sets the environment top resolve values from to the given value.
	 * The next call to get the properties will result in a recalculation.
	 * @param newEnv the new environment
	 */
	setEnvironment: (newEnv: NodeJS.ProcessEnv) => void
}
