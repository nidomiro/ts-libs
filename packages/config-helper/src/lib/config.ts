import { NormalizedSchema } from "@nidomiro/config-helper";

export interface Config<T> {

	getSchema(): NormalizedSchema<T>

}
