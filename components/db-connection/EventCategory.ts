import type { RecordIdentifier } from './DBHelpers';
import prisma from '@/components/db-connection-prisma';
import * as Organization from './Organization';
import { copyProps } from './DBHelpers';

export interface EventCategoryIdentifier extends RecordIdentifier {
	id_organization?: number;
	id_organization_ref?: string;
}

export interface BaseEventCategory {
	name: string;
    description?: string;
}

export interface EventCategoryInsert extends BaseEventCategory {
    id_ref?: string;
    id_organization: number;
}

/**
 * The event category as returned from the database
 */
export interface EventCategory extends EventCategoryInsert {
	id: number;
}

/**
 * An event category appropriate for return to a consuming application
 */
export class EventCategoryResponse implements BaseEventCategory{
	name = "";
	description?: string = null;

	constructor(category: EventCategory) {
		copyProps(this, category);
	}
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