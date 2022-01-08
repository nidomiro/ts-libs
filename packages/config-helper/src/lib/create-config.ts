import { Schema } from './schema'
import { Config } from './config'
import { ConfigOptions } from './config-options'
import { ConfigDefaultImpl } from './config-default-impl'

export function createConfig<TSchema extends Schema<unknown>>(schema: TSchema, opts?: ConfigOptions): Config<TSchema> {
	return new ConfigDefaultImpl(schema, opts)
}
