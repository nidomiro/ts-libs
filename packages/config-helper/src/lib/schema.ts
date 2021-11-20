export interface SchemaObj<T> {
	default: T | null;
	transformer?: (val: unknown) => T;
	env?: string;
	maskValueInToString?: boolean;
	description?: string;
	optional?: boolean;
}

export type Schema<T> = {
	[P in keyof T]: T[P] extends { default: infer U } ? SchemaObj<U> : Schema<T[P]>;
};



export function isSchemaObject<T>(x: Schema<T> | SchemaObj<T>): x is SchemaObj<T> {
	return 'default' in x
}

