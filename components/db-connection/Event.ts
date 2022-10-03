import type { RecordIdentifier } from './DBHelpers';
import { getReference } from './DBHelpers';
import prisma from '@/components/db-connection-prisma';
import { Event, EventCategory, EventRole, EventPosition, Organization } from '.';

export interface EventIdentifier extends RecordIdentifier {
	id_organization?: number;
	id_organization_ref?: string;
}

/**
 * A list of optional event fields, suitable for create or update
 */
export interface EventOptionalData {
	id_ref?: string;
    end_date?: Date;
    description?: string;
}

/**
 * The required fields, suitable for create
 */
export interface EventInsertData extends EventOptionalData {
	start_date: Date;
    name: string;
}

/**
 *	Optional fields, suitable for update
 */
export interface EventUpdateData extends EventOptionalData {
	start_date?: Date;
    name?: string;
}

export interface EventUpsert {
	// When inserting an event, you MAY provide an event category or an associated list of event roles
	event_role?: EventEventRoleInsert[]
	event_category?: RecordIdentifier
}

export interface EventInsert extends EventInsertData, EventUpsert {
	// When inserting an item, you MUST provide the associated org
	organization: RecordIdentifier
}

export interface EventUpdate extends EventUpdateData, EventUpsert {
	// When updating an item you MAY provide the associated org
	organization?: RecordIdentifier
}

/**
 * An precursor to an event role insert that lacks event information
 */
export interface EventEventRoleInsert extends EventRole.EventRoleCoreData {
	
	// When inserting an event role, you MAY provide a list of positions associated with that role
	event_position?: EventPosition.EventPositionCoreData[];
}

/**
 * Gets core event data from more complex event interfaces
 */
export function eventData<Type = EventInsertData | EventUpdateData>(event: EventInsertData | EventUpdateData): Type {
	return {
		id_ref: event.id_ref,
		start_date: event.start_date,
		end_date: event.end_date,
		name: event.name,
		description: event.description
	} as Type;
}

export interface Event extends EventInsertData {
	id: number;
	id_organization: number;
	id_event_category: number;
}

/**
 * Upserts a list of event roles for a given event
 */
async function upsertRoles(event: EventIdentifier, roles: EventEventRoleInsert[]) {
	for (const idx in roles) {

	const eventRoleId = {
			id_event: event.id,
			id_organization: event.id_organization,
			id_ref: roles[idx].id_ref
		};

		await EventRole.upsert(eventRoleId, {
			...roles[idx],
			event: {
				id: event.id
			}
		});
	}
}

/**
 * Finds and connects the associated event category, if applicable
 */
async function getConnectEventCatParam(event) {
	const eventCatParam = {};
	if(event.event_category){
		const eventCat = await EventCategory.get({
			id: event.event_category.id,
			id_ref: event.event_category.id_ref,
			id_organization: event.organization.id,
			id_organization_ref: event.organization.id_ref
		});
		eventCatParam['event_category'] = {
			connect: {
				id: eventCat.id
			}
		};
	}
	return eventCatParam;
}

/**
 * Creates an event in the database
 */
export async function create(event: EventInsert): Promise<Event> {
	//TODO: Ensure we don't end up with a duplicate combo of event.id_ref and id_organization; or should this be in the schema?
	//It probably needs to be here since id_ref is optional; and there CAN be multiple events with no id_ref for a given organization
	
	const orgId = getReference({
		id: event.organization.id,
		id_ref: event.organization.id_ref
	});

	const eventCatParam = await getConnectEventCatParam(event);
	const createdEvent = await prisma.event.create({
		data: {
			...(eventData(event) as EventInsertData),
			...eventCatParam,
			organization: {
				connect: {
					[orgId[0]]: orgId[1]
				}
			}
		}
	});

	if(event.event_role) {
		const updatedRoles: EventRole.EventRoleInsert[] = event.event_role.map( role => {
			return {
				...role,
				event: {id: createdEvent.id}
			};
		});

		await upsertRoles(createdEvent, updatedRoles);
	}

	return createdEvent;
}

/**
 * Upserts an event in the database
 */
export async function upsert(eventId: EventIdentifier, event: EventInsert) {
	const theEvent = await get({eventId});

	if(theEvent) {
		await update(eventId, event);
	} else {
		await create(event);
	}
}

/**
 * Updates an event in the database
 */
 export async function update(eventId: EventIdentifier, event: EventUpdate) {

	const theEvent = await get({eventId});
	
	if (event.organization) {
		theEvent.id_organization = (await Organization.get(event.organization)).id;
	}
	const where = await getUniqueEventWhereClause(eventId);
	await prisma.event.updateMany({
		data: {
			...eventData(event),
		},
		where: where
	});

	if(event.event_role) {
		await upsertRoles(theEvent, event.event_role);
	}
}

/**
 * Builds a where clause for selecting a specific record; uses the record id
 * if available, and the unique reference string as a fallback
 */
async function getUniqueEventWhereClause(eventId: EventIdentifier) {
	
	const where = {};
	if (eventId.id) {
		where['id'] = eventId.id;
	} else {
		where['id_ref'] = eventId.id_ref;

		const orgId = getReference({
			id: eventId.id_organization,
			id_ref: eventId.id_organization_ref
		});

		where['organization'] = {
			[orgId[0]]: orgId[1]
		};
	}

	return where;
}

export interface GetEventParams {
	eventId: EventIdentifier;
	includeOrg?: boolean;
}


/**
 * Gets an event from the database by id or reference
 */
export async function get({eventId, includeOrg = true}: GetEventParams): Promise<Event> {
	
	const include = {
		organization: includeOrg
	};

	const where = await getUniqueEventWhereClause(eventId);
	return await prisma.event.findFirst({
		where: where,
		include: include
	});
}

/**
 * Removes an event from the database
 */
export async function remove(eventId: EventIdentifier) {
	const where = await getUniqueEventWhereClause(eventId);
	await prisma.event.delete({
		where: where
	});
}