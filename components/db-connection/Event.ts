import type { RecordIdentifier } from './DBHelpers';
import prisma from '@/components/db-connection-prisma';
import * as Organization from './Organization';
import * as EventCategory from './EventCategory';
import { Prisma } from '@prisma/client';
import { copyProps } from './DBHelpers';

export interface EventIdentifier extends RecordIdentifier {
	id_organization?: number;
	id_organization_ref?: string;
}

export interface BaseEvent {
	start_date: Date;
    end_date?: Date;
    all_day: boolean;
	name: string;
    description?: string;
	addl_info?: Prisma.JsonValue;
}

export interface EventInsert extends BaseEvent {
    id_organization: number;
    id_event_category?: number;
    id_ref?: string;
}

export interface Event extends EventInsert {
	id: number;
}

/**
 * An event appropriate for return to a consuming application
 */
export class EventResponse implements BaseEvent{
	start_date: Date = new Date();
    end_date?: Date = null;
    all_day = true;
	name = "";
    description?: string = null;
	addl_info?: Prisma.JsonValue = null;

	constructor(event: Event) {
		copyProps(this, event);
	}
}

/**
 * Creates an event in the database
 */
export async function create(event: EventInsert): Promise<Event> {
	//TODO: Ensure we don't end up with a duplicate combo of event.id_ref and id_organization; or should this be in the schema?
	//It probably needs to be here since id_ref is optional; and there CAN be multiple events with no id_ref for a given organization
	const eventReplaced = await replaceRefs(event);
	
	return await prisma.event.create({
		data: eventReplaced,
	});
}

/**
 * Updates an event in the database
 */
 export async function update(event: Event) {
	
	const eventReplaced = await replaceRefs(event);
	const where = await getUniqueEventWhereClause(eventReplaced);
	
	return await prisma.event.updateMany({
		data: eventReplaced,
		where: where
	});
}

/**
 * Replaces object references to database identifiers
 */
async function replaceRefs(event) {
	
	// Don't modify the passed object
	const eventCopy = JSON.parse(JSON.stringify(event));

	// Find the matching organization, if necessary
	if (eventCopy.id_organization_ref) {
		const org = await Organization.get({id_ref: eventCopy.id_organization_ref});
		if(!org) {
			throw new Error('The organization referenced does not exist');
		}
		eventCopy.id_organization = org.id;
		delete eventCopy.id_organization_ref;
	}

	// Find the matching event category, if necessary
	if (eventCopy.id_event_category_ref) {
		const eventCategory = await EventCategory.get({
			id_ref: eventCopy.id_event_category_ref,
			id_organization: eventCopy.id_organization
		});
		if(!eventCategory) {
			throw new Error('The event category referenced does not exist for the organization referenced');
		}
		eventCopy.id_event_category = eventCategory.id;
		delete eventCopy.id_event_category_ref;
	}
	
	return eventCopy;
}

/**
 * Builds a where clause for selecting a specific record; uses the record id
 * if available, and the unique reference string as a fallback
 */
async function getUniqueEventWhereClause(event: EventIdentifier) {
	
	const where = {};
	if (event.id) {
		where['id'] = event.id;
	} else {
		if (event.id_organization_ref) {
			const eventReplaced = await replaceRefs(event);
			event.id_organization = eventReplaced.id_organization;
			delete event.id_organization_ref;
		}
		where['id_organization'] = event.id_organization;
		where['id_ref'] = event.id_ref;
	}

	return where;
}

// Get all events where 
//export async function getEvents

/**
 * Gets an event from the database by id or reference
 */
export async function get(event: EventIdentifier): Promise<Event> {
	const where = await getUniqueEventWhereClause(event);
	return await prisma.event.findFirst({
		where: where
	});
}

/**
 * Removes an event from the database
 */
export async function remove(event: EventIdentifier) {
	const where = await getUniqueEventWhereClause(event);
	await prisma.event.delete({
		where: where
	});
}