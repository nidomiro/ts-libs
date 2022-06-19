import { Loader } from './loader'

export interface ConfigOptions {
	/**
	 * Adds the given string as prefix of every generated env.
	 *
	 * default: no prefix
	 */
	envPrefix?: string
	/**
	 * Apply the envPrefix to existing env entries if true.
	 *
	 * default: false
	 */
	prefixExistingEnv?: boolean

	/**
	 * Override the used environment
	 *
	 * default: process.env
	 */
	env?: NodeJS.ProcessEnv | undefined

	/**
	 * A list of loaders to be used to resolve the config-value.
	 * The list is read from front to back, and the first match will be used as value.
	 *
	 * default: [envVarLoader, fileEnvVarLoader, defaultLoader]
	 */
	valueLoaders?: Loader[]
}
