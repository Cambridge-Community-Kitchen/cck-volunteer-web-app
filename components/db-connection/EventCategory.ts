import type { RecordIdentifier } from './DBHelpers';
import prisma from '@/components/db-connection-prisma';
import * as Organization from './Organization';

export interface EventCategoryIdentifier extends RecordIdentifier {
	id_organization?: number;
	id_organization_ref?: string;
}

export interface EventCategoryInsert {
    id_ref?: string;
    name: string;
    id_organization: number;
    description?: string;
}

export interface EventCategory extends EventCategoryInsert {
	id: number;
}

/**
 * Creates an event category in the database
 */
export async function create(category: EventCategoryInsert) {
	return await prisma.event_category.create({
		data: category,
	});
}

/**
 * Gets an event category from the database
 */
export async function get(category: EventCategoryIdentifier): Promise<EventCategory> {
	if (category.id_organization_ref) {
		const org = await Organization.get({id_ref: category.id_organization_ref});
		category.id_organization = org.id;
	}
	
	const where = {};
	if (category.id) {
		where['id'] = category.id;
	} else {
		where['id_organization'] = category.id_organization;
		where['id_ref'] = category.id_ref;
	}

	return await prisma.event_category.findFirst({
		where: where
	});
}