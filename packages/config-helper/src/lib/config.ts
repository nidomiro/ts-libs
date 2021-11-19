import { NormalizedSchema } from "@nidomiro/config-helper";
import { Properties } from "./properties";

export interface Config<T> {

	getSchema: () => NormalizedSchema<T>

	getProperties: () => Properties<T>

}
