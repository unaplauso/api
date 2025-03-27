import { Service } from './service.enum';

export function serviceExists(id: string) {
	return Object.values(Service).includes(id as Service);
}
