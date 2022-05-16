import { ConfigError, RequiredButNull, NotConvertable } from '@nidomiro/config-helper'
import { config } from './config'

describe(`config tests`, () => {
	it(`invalid config test`, () => {
		config.setEnvironment({})
		expect(() => config.getPropertiesOrThrow()).toThrow(ConfigError)
		try {
			config.getPropertiesOrThrow()
			fail()
		} catch (configError) {
			if (configError instanceof ConfigError) {
				expect(configError.errors).toEqual([
					{ errorType: RequiredButNull, propertyPath: ['database', 'username'], inputValue: null },
					{ errorType: RequiredButNull, propertyPath: ['database', 'password'], inputValue: null },
				])
			} else {
				fail()
			}
		}
	})

	it(`invalid config test with invalid stringParam argument`, () => {
		config.setEnvironment({
			DATABASE_CONNECTION_URL: 'test url',
			DATABASE_USERNAME: 'testUser',
			DATABASE_PASSWORD: 'testPassword',
		})

		expect(() => config.getPropertiesOrThrow()).toThrow(ConfigError)
		try {
			config.getPropertiesOrThrow()
			fail()
		} catch (configError) {
			if (configError instanceof ConfigError) {
				expect(configError.errors).toEqual([
					{ errorType: NotConvertable, propertyPath: ['database', 'connectionUrl'], inputValue: 'test url' },
				])
			} else {
				fail()
			}
		}
	})

	it(`valid config properties test`, () => {
		config.setEnvironment({
			NODE_ENV: 'development',
			PORT: '80',
			DATABASE_CONNECTION_URL: 'dbms://test.local',
			DATABASE_USERNAME: 'testUser',
			DATABASE_PASSWORD: 'testPassword',
			ENABLE_FEATURE_X: 'true', // '1' also works
			NAME_VALIDATION_REGEX: '^\\d+$',
		})

		expect(config.getPropertiesOrThrow()).toEqual({
			env: 'development',
			port: 80, // Will be configurable via env-var 'PORT'
			database: {
				connectionUrl: 'dbms://test.local',
				username: 'testUser',
				password: 'testPassword',
			},
			someOptionalProp: null,
			enableFeatureX: true,
			nameValidationRegex: /^\d+$/,
		})
	})
})
