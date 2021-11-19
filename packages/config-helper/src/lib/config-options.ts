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
	env?: NodeJS.ProcessEnv | undefined;
}
