import type { RecordIdentifier } from './DBHelpers';
import prisma from '@/components/db-connection-prisma';
import * as Event from './Event';
import * as EventRole from './EventRole';
import { getReference } from './DBHelpers';

/**
 * The data needed to uniquely identify an event position
 */
export interface EventPositionIdentifier extends RecordIdentifier {
	id_organization?: number;
	id_organization_ref?: string;
	id_event?: number;
	id_event_ref?: string;
	id_event_role?: number;
	id_event_role_ref?: string;
}

/**
 * Optional data, suitable for both inserts and updates
 */
export interface EventPositionOptionalCoreData {
	id_ref?: string;
	description?: string;
}

/**
 * Required data, suitable for inserts only
 */
 export interface EventPositionCoreData extends EventPositionOptionalCoreData {
	name: string;
}

/**
 * Data needed to insert a new record in the database
 */
export interface EventPositionInsert extends EventPositionCoreData {
	
	// To insert an event position, you MUST provide the unique event to which this position belongs
	event: Event.EventIdentifier

	// When inserting an event position, you MAY provide the unique event role to which this position belongs
	event_role?: EventRole.EventRoleIdentifier
}

/**
 * Data needed to update a new record in the database
 */
 export interface EventPositionUpdate extends EventPositionCoreData {
	
	// To update an event position, you MAY provide the unique event to which this position belongs
	event: Event.EventIdentifier

	// When updating an event position, you MAY provide the unique event role to which this position belongs
	event_role?: EventRole.EventRoleIdentifier
}

/**
 * The event position as returned from the database. References to the full event and event role objects are optionally included
 */
export interface EventPosition extends EventPositionCoreData {
	id: number;
	id_event: number;
	id_event_role?: number;
	event?: Event.Event;
	event_role?: EventRole.EventRole;
}

/**
 * Gets core event data from more complex event interfaces
 */
 export function eventPositionData(eventPosition: EventPositionInsert | EventPosition): EventPositionCoreData {
	return {
		id_ref: eventPosition.id_ref,
		name: eventPosition.name,
		description: eventPosition.description
	};
}

/**
 * Creates an event position in the database
 */
export async function create(eventPosition: EventPositionInsert): Promise<EventPosition> {
	
	const event = await Event.get({eventId: eventPosition.event});
	
	const eventRole = {};
	if (eventPosition.event_role) {
		const gottenRole = await EventRole.get(eventPosition.event_role);
		eventRole['event_role'] = {
			connect: {
				id: gottenRole.id
			}
		};
	}

	return await prisma.event_position.create({
		data: {
			...eventPositionData(eventPosition),
			event: {
				connect: {
					id: event.id
				}
			},
			...eventRole
		}
	});
}

/**
 * Upserts an event position in the database
 */
export async function upsert(eventPositionId: EventPositionIdentifier, eventPosition: EventPositionInsert) {
	const theEventPosition = await get(eventPositionId);

	if(theEventPosition) {
		update(eventPositionId, eventPosition);
	} else {
		create(eventPosition);
	}
}

/**
 * Updates an event role in the database
 */
 export async function update(positionId: EventPositionIdentifier, eventPosition: EventPositionUpdate) {
	
	const where = await getUniqueEventPositionWhereClause(positionId);
	
	return await prisma.event_position.updateMany({
		data: {
			...eventPositionData(eventPosition),
		},
		where: where
	});
}

/**
 * Builds a where clause for selecting a specific record; uses the record id
 * if available, and the unique reference string as a fallback
 */
async function getUniqueEventPositionWhereClause(eventPosition: EventPositionIdentifier) {
	
	const where = {};
	// If we have event position id, that's all we need
	if (eventPosition.id) {
		where['id'] = eventPosition.id;
	} else {
		// Otherwise, look up for a matching reference
		where['id_ref'] = eventPosition.id_ref;
		
		// Limiting it to the specific event
		// Position identifiers should be unique within a given event
		if (eventPosition.id_event) {
			where['id_event'] = eventPosition.id_event;
		} else {
			const orgId = getReference({
				id: eventPosition.id_organization,
				id_ref: eventPosition.id_organization_ref
			});
			where['event'] = {
				id_ref: eventPosition.id_event_ref,
				organization: {
					[orgId[0]]: orgId[1]
				}
			};
		}
	}
	return where;
}

/**
 * Deletes all positions for a given event that do not match a set of position references
 */
 export async function deletePositionsNotInRefs(event: Event.EventIdentifier, refs: string[]) {
	return await prisma.event_position.deleteMany({
		where: { 
			id_event: event.id, 
			NOT: {
				id_ref: { in: refs }
			}
		}
	});
}

/**
 * Gets an event position from the database
 */
export async function get(eventPosition: EventPositionIdentifier): Promise<EventPosition> {

	const where = await getUniqueEventPositionWhereClause(eventPosition);

	return await prisma.event_position.findFirst({
		where: where
	});
}