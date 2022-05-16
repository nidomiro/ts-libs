import { ok } from 'neverthrow'
import { envVarLoader } from '@nidomiro/config-helper'

describe(`altEnvVars tests`, () => {
	it.each([
		['TEST_PROP', ['TEST_PROP2'], { TEST_PROP2: `MyValue2` }, ok('MyValue2')],
		['TEST_PROP', ['TEST_PROP2', 'TEST_PROP1'], { TEST_PROP2: `MyValue2` }, ok('MyValue2')],
		['TEST_PROP', ['TEST_PROP2', 'TEST_PROP1'], { TEST_PROP1: `MyValue1`, TEST_PROP2: `MyValue2` }, ok('MyValue2')],
	])(`for altEnvVars '%s' and env '%s' prop value should be '%s'`, (envVar, altEnvVars, env, expectedValue) => {
		const result = envVarLoader(env, { altEnvVars, envVar, trimValue: false, defaultValue: '' }, [])
		expect(result).toEqual(expectedValue)
	})
})
