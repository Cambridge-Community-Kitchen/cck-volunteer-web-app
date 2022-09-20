import prisma from '@/components/db-connection-prisma';
import { Prisma } from '@prisma/client';

export interface RouteInsert {
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