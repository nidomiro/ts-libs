import { NormalizeSchema } from './normalized-schema';
import { Schema } from './schema';
import { Properties } from './properties';

export interface Config<TSchema extends Schema<unknown>> {
	getSchema: () => NormalizeSchema<TSchema>;

	getProperties: () => Properties<TSchema>;
}
