import { NormalizeSchema } from './normalized-schema'
import { Schema } from './schema'
import { SchemaError } from './schema.error'
import { Properties } from './properties'
import { Result } from 'neverthrow'

export interface Config<TSchema extends Schema<unknown>> {
	getSchema: () => NormalizeSchema<TSchema>

	getProperties: () => Result<Properties<TSchema>, SchemaError[]>
}
