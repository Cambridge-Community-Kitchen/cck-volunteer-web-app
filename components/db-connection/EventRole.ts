import type { RecordIdentifier } from './DBHelpers';
import prisma from '@/components/db-connection-prisma';
import { Event, EventPosition } from '.';
import { getReference } from './DBHelpers';

/**
 * The data necessary to uniquely identify an event role
 */
export interface EventRoleIdentifier extends RecordIdentifier {
	id_organization?: number;
	id_organization_ref?: string;
	id_event?: number;
	id_event_ref?: string;
}

/**
 * Optional fields in the database
 */
export interface EventRoleOptionalCoreData {
	id_ref?: string;
	description?: string;
	general_volunteers_needed?: number
}

/**
 * Required data, suitable for inserts only
 */
export interface EventRoleCoreData extends EventRoleOptionalCoreData {
	name: string;
}

/**
 * Data needed to insert a new record in the database
 */
export interface EventRoleInsert extends EventRoleCoreData {
	
	// To insert an event role, you MUST provide the unique event to which this position belongs
	event: Event.EventIdentifier

	// When inserting an event role, you MAY provide a list of positions associated with that role
	event_position?: EventPosition.EventPositionCoreData[]
}

/**
 * Data needed to update a new record in the database
 */
 export interface EventRoleUpdate extends EventRoleCoreData {
	
	// To update an event role, you MAY provide the unique event to which this position belongs
	event: Event.EventIdentifier
}

/**
 * The data as returned from the database. Full references to linked records are optionally included
 */
 export interface EventRole extends EventRoleCoreData {
	id: number;
	id_event: number;
	event?: Event.Event;
 }

/**
 * Creates an event role in the database
 */
export async function create(eventRole: EventRoleInsert): Promise<EventRole> {
	
	const event = await Event.get({eventId: eventRole.event});
	
	const createdEventRole = await prisma.event_role.create({
		data: {
			...eventRoleData(eventRole),
			event: {
				connect: {
					id: event.id
				}
			}
		}
	});

	if(eventRole.event_position) {
		const updatedPositions: EventPosition.EventPositionInsert[] = eventRole.event_position.map( position => {
			return {
				...position,
				event: {id: event.id},
				event_role: {id: createdEventRole.id}
			};
		});

		await upsertPositions(event, updatedPositions);
	}

	return createdEventRole;
}

/**
 * Inserts one or more positions for a given event
 */
async function upsertPositions(event: Event.EventIdentifier, roles: EventPosition.EventPositionCoreData[]) {
	for (const idx in roles) {

		const eventPositionId = {
			id_event: event.id,
			id_organization: event.id_organization,
			id_ref: roles[idx].id_ref
		};

		await EventPosition.upsert(eventPositionId, {
			...roles[idx],
			event: {
				id: event.id
			}
		});
	}
}

/**
 * Upserts an event role in the database
 */
export async function upsert(eventRoleId: EventRoleIdentifier, eventRole: EventRoleInsert) {
	const theEventRole = await get(eventRoleId);

	if(theEventRole) {
		update(eventRoleId, eventRole);
	} else {
		create(eventRole);
	}
}

/**
 * Updates an event role in the database
 */
 export async function update(roleId: EventRoleIdentifier, eventRole: EventRoleUpdate ) {
	
	const where = await getUniqueEventRoleWhereClause(roleId);
	
	return await prisma.event_role.updateMany({
		data: {
			...eventRoleData(eventRole),
		},
		where: where
	});
}

/**
 * Builds a where clause for selecting a specific record; uses the record id
 * if available, and the unique reference string as a fallback
 */
 async function getUniqueEventRoleWhereClause(roleId: EventRoleIdentifier) {
	
	const whereClause = {};
	if (roleId.id) {
		whereClause['id'] = roleId.id;
	} else {
		whereClause['id_ref'] = roleId.id_ref;
		if (roleId.id_event) {
			whereClause['id_event'] = roleId.id_event;
		} else {
			const orgId = getReference({
				id: roleId.id_organization,
				id_ref: roleId.id_organization_ref
			});
			whereClause['event'] = {
				id_ref: roleId.id_event_ref,
				organization: {
					[orgId[0]]: orgId[1]
				}
			};
		}
	}

	return whereClause;
}

/**
 * Gets core data from more complex interfaces
 */
export function eventRoleData(eventRole: EventRoleInsert | EventRole): EventRoleCoreData {
	return {
		id_ref: eventRole.id_ref,
		name: eventRole.name,
		description: eventRole.description,
		general_volunteers_needed: eventRole.general_volunteers_needed
	};
}

/**
 * Confirms whether or not the minimum information to identify a unique event role has been provided
 */
export function isValidEventRoleIdentifier(roleId: EventRoleIdentifier) {
	return roleId.id || (roleId.id_ref && (roleId.id_event || (roleId.id_event_ref && (roleId.id_organization || roleId.id_organization_ref))));
}

/**
 * Deletes all roles for a given event that do not match a set of role references
 */
export async function deleteRolesNotInRefs(event: Event.EventIdentifier, refs: string[]) {
	return await prisma.event_role.deleteMany({
		where: { 
			id_event: event.id, 
			NOT: {
				id_ref: { in: refs }
			}
		}
	});
}

/**
 * Gets an event role from the database
 */
export async function get(eventRole: EventRoleIdentifier): Promise<EventRole> {
	const where = await getUniqueEventRoleWhereClause(eventRole);

	return await prisma.event_role.findFirst({
		where: where
	});
}