export interface SchemaObjCommon<T = unknown> {
	transformer?: (val: unknown) => T;
	env?: string;
	[key: string]: unknown;
}

export interface OptionalSchemaObj<T = unknown> extends SchemaObjCommon {
	default: T;
	optional: true;
}

export interface RequiredSchemaObj<T = unknown> extends SchemaObjCommon {
	default: T | null;
	optional?: false;
}

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type SchemaObj<T = unknown> = OptionalSchemaObj<T> | RequiredSchemaObj<T>

export type Schema<T> = {
	//[P in keyof T]: T[P] extends { default: infer U } ? SchemaObj<U> : Schema<T[P]>;
	[P in keyof T]: SchemaObj<T[P]> | Schema<T[P]>;
};



export function isSchemaObject<T>(x: Schema<T> | SchemaObj<T>): x is SchemaObj<T> {
	return 'default' in x
}


export interface CSchemaObj<T = any> {
	/**
	 * You can define a configuration property as "required" without providing a default value.
	 * Set its default to null and if your format doesn't accept null it will throw an error.
	 */
	default: T | null;
	doc?: string | undefined;
	/**
	 * From the implementation:
	 *
	 *  format can be a:
	 *   - predefined type, as seen below
	 *   - an array of enumerated values, e.g. ["production", "development", "testing"]
	 *   - built-in JavaScript type, i.e. Object, Array, String, Number, Boolean
	 *   - function that performs validation and throws an Error on failure
	 *
	 * If omitted, format will be set to the value of Object.prototype.toString.call
	 * for the default value
	 */
	format?: any | any[] | ((val: any) => asserts val is T) | ((val: any) => void) | undefined;
	env?: string | undefined;
	arg?: string | undefined;
	sensitive?: boolean | undefined;
	nullable?: boolean | undefined;
	[key: string]: any;
}

export type CSchema<T> = {
	[P in keyof T]: CSchema<T[P]> | CSchemaObj<T[P]>;
};

