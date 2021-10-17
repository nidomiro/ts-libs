import * as convict from 'convict';
import { constantCase } from 'change-case';

// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
const CONVICT_FORMAT_WITH_VALIDATOR = require('convict-format-with-validator');
convict.addFormats(CONVICT_FORMAT_WITH_VALIDATOR);

function addEnv<T>(schema: convict.Schema<T>): convict.Schema<T> {
	function iterate(currentObject: convict.Schema<T>, currentPath: string[]): convict.Schema<T> {
		const hasDefault = 'default' in currentObject;
		const hasEnv = 'env' in currentObject;
		if (hasDefault && !hasEnv) {
			return {
				...currentObject,
				env: constantCase(currentPath.join('_')),
			};
		} else if (!hasDefault) {
			const alteredObjects: Array<convict.Schema<T>> = Object.entries(currentObject).map((entry) => {
				const [key, value] = entry;
				let newVal = value;
				if (typeof value === 'object' && value != null) {
					newVal = iterate(value as convict.Schema<T>, [...currentPath, key]);
				}
				return {
					[key]: newVal,
				} as convict.Schema<T>;
			});
			return Object.assign({}, ...alteredObjects) as convict.Schema<T>;
		} else {
			return currentObject;
		}
	}

	return iterate(schema, []);
}

export function createConfig<T>(schema: convict.Schema<T>, opts?: convict.Options): convict.Config<T> {
	return convict(addEnv(schema), opts);
}
