import type { RecordIdentifier } from './DBHelpers';
import prisma from '@/components/db-connection-prisma';
import * as Organization from './Organization';
import { getReference } from './DBHelpers';

export interface EventCategoryIdentifier extends RecordIdentifier {
	id_organization?: number;
	id_organization_ref?: string;
}

export interface EventCategoryData {
    id_ref?: string;
    name: string;
    description?: string;
}

export interface EventCategoryInsert extends EventCategoryData {
	organization: RecordIdentifier
}

/**
 * Gets core event category data from more complex interfaces
 */
function eventCategoryData(eventCategory: EventCategoryInsert): EventCategoryData {
	return {
		id_ref: eventCategory.id_ref,
		name: eventCategory.name,
		description: eventCategory.description
	};
}

export interface EventCategory extends EventCategoryData {
	id: number;
	id_organization: number;
}

/**
 * Creates an event category in the database, optionally linking it to one or more organizations
 */
 export async function create(eventCategory: EventCategoryInsert): Promise<EventCategory> {

	const orgRef = getReference(eventCategory.organization);

	return await prisma.event_category.create({
		data: {
			...eventCategoryData(eventCategory),
			organization: {
				connect: {
					[orgRef[0]]: orgRef[1]
				}
			}
		}
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