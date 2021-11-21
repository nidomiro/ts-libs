import { MustHaveNull } from "./util";


export interface ConfigDefinitionCommon<T> {
	transformer: (val: unknown) => T;
	envVar?: string;
}

export interface ConfigDefinitionOptional<T> extends ConfigDefinitionCommon<T> {
	optional: false
}
export interface ConfigDefinitionRequired<T> extends ConfigDefinitionCommon<T>{
	optional: true
}

export type ConfigDefinition<T> = ConfigDefinitionOptional<T> | ConfigDefinitionRequired<T>

export type Schema<T> = {
	[P in keyof T]: ConfigDefinitionOptional<T[P]> | ConfigDefinitionRequired<T[P]> | Schema<T>
}


export function configDef<T extends {} | null>(transformer: (val: unknown) => MustHaveNull<T>, config: {optional: true, envVar?: string}): ConfigDefinitionOptional<MustHaveNull<T>>
// eslint-disable-next-line @typescript-eslint/ban-types
export function configDef<T extends (null extends T ? never: {})>(transformer: (val: unknown) => T | null,  config?:{ optional?: false, envVar?: string}): null extends T ? never : ConfigDefinitionRequired<T>
export function configDef<T>(transformer: (val: unknown) => T, config?: { optional?: boolean, envVar?: string}): ConfigDefinition<T> | ConfigDefinitionRequired<T> {
	return {
		transformer,
		optional: config?.optional ?? false,
		envVar: config?.envVar
	}
}
