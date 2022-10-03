import prisma from '@/components/db-connection-prisma';
import { Prisma } from '@prisma/client';
import { copyProps } from './DBHelpers';


export interface BaseRoute {
	name: string;
	distance?: Prisma.JsonValue;
}

export interface RouteInsert extends BaseRoute {
    id_ref?: string;
	id_event_position: number;
    name: string;
	distance?: Prisma.JsonValue;
	passcode?: string;
}

export interface Route extends RouteInsert {
	id: number;
}

/**
 * A route delivery appropriate for return to a consuming application
 */
 export class RouteResponse implements BaseRoute{
	name = "";
	distance?: Prisma.JsonValue = null;

	constructor(route: Route) {
		copyProps(this, route);
	}
}

/**
 * Creates an event role in the database
 */
export async function create(eventRole: RouteInsert): Promise<Route> {
	return await prisma.route.create({
		data: eventRole,
	});
}

/**
 * Deletes all routes associated with a given event position
 */
 export async function removeForPosition(eventPositionId: number) {
	return await prisma.route.deleteMany({
		where: { 
			id_event_position: eventPositionId
		}
	});
}