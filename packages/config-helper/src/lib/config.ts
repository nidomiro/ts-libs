import { NormalizeSchema, Schema } from "@nidomiro/config-helper";
import { Properties } from "./properties";

export interface Config<TSchema extends Schema<unknown>> {

	getSchema: () => NormalizeSchema<TSchema>

	getProperties: () => Properties<TSchema>

}



