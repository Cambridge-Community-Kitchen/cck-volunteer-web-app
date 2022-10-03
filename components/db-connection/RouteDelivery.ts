import prisma from '@/components/db-connection-prisma';
import { copyProps } from './DBHelpers';


export interface BaseRouteDelivery {
	portions: number;
	name?: string;
	phone?: string;
	address: string;
	plus_code: string;
	allergies?: string;
	notes?: string;
	when_not_home?: string;
}

/**
 * A route delivery ready to be inserted into the database
 */
export interface RouteDeliveryInsert extends BaseRouteDelivery {
    id_route: number;
	sequence: number;
}

/**
 * The route delivery as returned from the database
 */
export interface RouteDelivery extends RouteDeliveryInsert {
	id: number;
}

/**
 * A route delivery appropriate for return to a consuming application
 */
export class RouteDeliveryResponse implements BaseRouteDelivery{
	portions = 0;
	name?: string = null;
	phone?: string = null;
	address = "";
	plus_code = "";
	allergies?: string = null;
	notes?: string = null;
	when_not_home?: string = null;

	constructor(delivery: RouteDelivery) {
		copyProps(this, delivery);
	}
}

/**
 * Creates a route delivery in the database
 */
export async function create(routeDelivery: RouteDeliveryInsert): Promise<RouteDelivery> {
	return await prisma.route_delivery.create({
		data: routeDelivery,
	});
}