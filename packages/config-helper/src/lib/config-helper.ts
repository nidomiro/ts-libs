import * as convict from 'convict';
import { constantCase } from 'change-case';

const convict_format_with_validator = require('convict-format-with-validator');
convict.addFormats(convict_format_with_validator);


function addEnv<T>(schema: convict.Schema<T>): convict.Schema<T> {

	function iterate(currentObject: convict.Schema<T>, currentPath: string[]): convict.Schema<T> {
		const hasDefault = 'default' in currentObject;
		const hasEnv = 'env' in currentObject;
		if (hasDefault && !hasEnv) {
			return {
				...currentObject,
				env: constantCase(currentPath.join('_'))
			};
		} else if (!hasDefault) {
			const alteredObjects: convict.Schema<T>[] = Object.entries(currentObject).map(
				(entry) => {
					const [key, value] = entry;
					let newVal = value;
					if (typeof value === 'object' && value != null) {
						newVal = iterate(value as convict.Schema<T>, [...currentPath, key]);
					}
					return {
						[key]: newVal
					} as convict.Schema<T>;
				}
			);
			return Object.assign({}, ...alteredObjects);
		} else {
			return currentObject;
		}
	}

	return iterate(schema, []);
}

export function createConfig<T>(schema: convict.Schema<T>, opts?: convict.Options): convict.Config<T> {

	return convict(addEnv(schema), opts);
}
