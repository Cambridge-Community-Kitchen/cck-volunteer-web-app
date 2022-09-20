import type { RecordIdentifier } from './DBHelpers';
import prisma from '@/components/db-connection-prisma';
import * as Event from './Event';
import * as Organization from './Organization';

export interface EventRoleIdentifier extends RecordIdentifier {
	id_organization?: number;
	id_organization_ref?: string;
	id_event?: number;
	id_event_ref?: string;
}

export interface EventRoleInsert {
    id_event: number;
    general_volunteers_needed?: number;
    id_ref?: string;
    name: string;
    description?: string;
}

export interface EventRole extends EventRoleInsert {
	id: number;
}

/**
 * Creates an event role in the database
 */
export async function create(eventRole: EventRoleInsert): Promise<EventRole> {
	return await prisma.event_role.create({
		data: eventRole,
	});
}

/**
 * Updates an event role in the database
 */
 export async function update(eventRole: EventRole) {
	
	const eventRoleReplaced = await replaceRefs(eventRole);
	const where = await getUniqueEventRoleWhereClause(eventRoleReplaced);
	
	return await prisma.event_role.updateMany({
		data: eventRoleReplaced,
		where: where
	});
}

/**
 * Builds a where clause for selecting a specific record; uses the record id
 * if available, and the unique reference string as a fallback
 */
 async function getUniqueEventRoleWhereClause(eventRole: EventRoleIdentifier) {
	
	const where = {};
	if (eventRole.id) {
		where['id'] = eventRole.id;
	} else {
		const eventRoleReplaced = await replaceRefs(eventRole);
		where['id_event'] = eventRoleReplaced.id_event;
		where['id_ref'] = eventRole.id_ref;
	}

	return where;
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
 * Replaces object references to database identifiers
 */
 async function replaceRefs(eventRole) {
	
	// Don't modify the passed object
	const eventRoleCopy = {...{}, ...eventRole};

	if (eventRoleCopy.id_organization_ref) {
		const organization = await Organization.get({id_ref: eventRoleCopy.id_organization_ref});
		eventRoleCopy.id_organization = organization.id;
	}

	// Find the matching event, if necessary
	if (eventRoleCopy.id_event_ref) {
		const event = await Event.get({id_organization: eventRoleCopy.id_organization, id_ref: eventRoleCopy.id_event_ref});
		if(!event) {
			throw new Error('The event referenced does not exist');
		}
		eventRoleCopy.id_event = event.id;
		delete eventRoleCopy.id_event_ref;
	}
	
	return eventRoleCopy;
}


/**
 * Gets an event role from the database
 */
export async function get(eventRole: EventRoleIdentifier): Promise<EventRole> {
	
	if (!isValidEventRoleIdentifier(eventRole)) {
		if (process.env.DEBUG === "true") {
			console.log(eventRole);
		}
		throw new Error('Identifier does not contain the required fields');
	}


	const eventRoleReplaced = await replaceRefs(eventRole);
	const where = await getUniqueEventRoleWhereClause(eventRoleReplaced);

	return await prisma.event_role.findFirst({
		where: where
	});
}