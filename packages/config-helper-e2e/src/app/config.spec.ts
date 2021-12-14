import { ConfigError, IllegalNullValue, NotConvertable } from '@nidomiro/config-helper'
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
					{ errorType: IllegalNullValue, propertyPath: ['database', 'username'], inputValue: null },
					{ errorType: IllegalNullValue, propertyPath: ['database', 'password'], inputValue: null },
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
})
