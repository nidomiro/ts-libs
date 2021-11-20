export type Properties<T> = {
	[P in keyof T]: T[P] extends { default: infer U, optional: true }
		? U | null
		: T[P] extends { default: infer U }
		? NonNullable<U>
		: Properties<T[P]>;
};
