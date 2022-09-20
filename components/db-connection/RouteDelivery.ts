import prisma from '@/components/db-connection-prisma';

export interface RouteDeliveryInsert {
    id_route: number;
	portions: number;
	name?: string;
	phone?: string;
	address: string;
	plus_code: string;
	allergies?: string;
	notes?: string;
	when_not_home?: string;
	sequence: number;
}

export interface RouteDelivery extends RouteDeliveryInsert {
	id: number;
}

/**
 * Creates a route delivery in the database
 */
export async function create(routeDelivery: RouteDeliveryInsert): Promise<RouteDelivery> {
	return await prisma.route_delivery.create({
		data: routeDelivery,
	});
}