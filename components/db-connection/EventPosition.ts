import type { RecordIdentifier } from './DBHelpers';
import prisma from '@/components/db-connection-prisma';
import * as Event from './Event';
import * as EventRole from './EventRole';
import * as Organization from './Organization';

export interface EventPositionIdentifier extends RecordIdentifier {
	id_organization?: number;
	id_organization_ref?: string;
	id_event?: number;
	id_event_ref?: string;
}

export interface EventPositionInsert {
    id_event: number;
    id_event_role?: number;
    id_ref?: string;
    name: string;
    description?: string;
}

export interface EventPosition extends EventPositionInsert {
	id: number;
}

/**
 * Creates an event position in the database
 */
export async function create(eventPosition: EventPositionInsert): Promise<EventPosition> {
	//TODO: Ensure we don't end up with a duplicate combo of position.id_ref and id_event; or should this be in the schema?
	return await prisma.event_position.create({
		data: eventPosition,
	});
}

/**
 * Updates an event position in the database
 */
 export async function update(eventPosition: EventPosition) {
	
	const eventPositionReplaced = await replaceRefs(eventPosition);
	const where = await getUniqueEventPositionWhereClause(eventPositionReplaced);
	
	return await prisma.event_position.updateMany({
		data: eventPositionReplaced,
		where: where
	});
}

/**
 * Replaces object references to database identifiers
 */
 async function replaceRefs(eventPosition) {
	
	// Don't modify the passed object
	const eventPositionCopy = {...{}, ...eventPosition};

	// Find the matching organization, if necessary
	if (eventPositionCopy.id_organization_ref) {
		const organization = await Organization.get({id_ref: eventPositionCopy.id_organization_ref});
		eventPositionCopy.id_organization = organization.id;
		delete eventPositionCopy.id_organization_ref;
	}

	// Find the matching event, if necessary
	if (eventPositionCopy.id_event_ref) {
		const event = await Event.get({id_organization: eventPositionCopy.id_organization, id_ref: eventPositionCopy.id_event_ref});
		if(!event) {
			throw new Error('The event referenced does not exist');
		}
		eventPositionCopy.id_event = event.id;
		delete eventPositionCopy.id_event_ref;
	}

	// Find the matching event role, if necessary
	if (eventPosition.id_event_role_ref) {
		const eventRole = await EventRole.get({id_event: eventPositionCopy.id_event, id_ref: eventPositionCopy.id_event_role_ref});
		if(!eventRole) {
			throw new Error('The event role referenced does not exist');
		}
		eventPositionCopy.id_event_role = eventRole.id;
		delete eventPositionCopy.id_event_role_ref;
	}
	
	return eventPositionCopy;
}

/**
 * Confirms whether or not the minimum information to identify a unique event position has been provided
 * If using refs, we need to know the organization, the event, and the event position. No two positions
 * should have the same ref for all three.
 */
export function isValidEventPositionIdentifier(positionId: EventPositionIdentifier) {
	return positionId.id || (positionId.id_ref && (positionId.id_event || (positionId.id_event_ref && (positionId.id_organization || positionId.id_organization_ref))));
}

/**
 * Builds a where clause for selecting a specific record; uses the record id
 * if available, and the unique reference string as a fallback
 */
async function getUniqueEventPositionWhereClause(eventPosition: EventPositionIdentifier) {
	
	const where = {};
	if (eventPosition.id) {
		where['id'] = eventPosition.id;
	} else {
		if (eventPosition.id_event_ref) {
			const eventPositionReplaced = await replaceRefs(eventPosition);
			eventPosition.id_event = eventPositionReplaced.id_event;
			delete eventPosition.id_event_ref;
		}		
		where['id_event'] = eventPosition.id_event;
		where['id_ref'] = eventPosition.id_ref;
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
	
	if (!isValidEventPositionIdentifier(eventPosition)) {
		if (process.env.DEBUG === "true") {
			console.log(eventPosition);
		}
		throw new Error('Identifier does not contain the required fields');
	}

	const eventPositionReplaced = await replaceRefs(eventPosition);
	const where = await getUniqueEventPositionWhereClause(eventPositionReplaced);

	return await prisma.event_position.findFirst({
		where: where
	});
}