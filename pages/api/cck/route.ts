import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/components/db-connection-prisma';
import type { VolunteerApiResponse } from '@/components/api-helpers';
import { makeResponse } from '@/components/api-helpers';
import { RouteDeliveryResponse } from '@/components/db-connection/RouteDelivery';
import { EventCategoryResponse } from '@/components/db-connection/EventCategory';
import { EventResponse } from '@/components/db-connection/Event';
import { RouteResponse } from '@/components/db-connection/Route';

const eventCategoryRef = 'meal-prep-delivery';

const eventRoleRef = 'delivery';

const errorResponses: { [key: string]: VolunteerApiResponse; } = Object.freeze({
    notFound: {
        code: 404,
        message: "Route not found"
    },
    invalidPasscode: {
        code: 403,
        message: "Passcode is invalid"
    },
    noPasscode: {
        code: 403,
        message: "For now, you MUST provide a passcode to access a route."
    }
});

/**
 * Parses a date string into multiple date formats
 */
function getDateFormats(dateString: string): [string, string] {
    
    const datePieces = dateString.split('-');
    
    if (datePieces.length != 3) { return [ dateString, dateString] }
    const date1 = [datePieces[0], datePieces[1], datePieces[2]].join('-')
    let date2 = [datePieces[2], datePieces[1], datePieces[0]].join('-')
    
    return [date1, date2];
}

/**
 * Gets route information
 * 
 * @param {NextApiRequest} req The Next.js API request
 * @param {NextApiResponse} res The Next.js API response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // To find route info, we need to know the date (e.g., 03-02-2022) and the route (e.g., arbury).
    // Everything else can be calculated
    // this is a cck-specific endpoint.  we know the organization is 'cck'
    // this is a delivery-route-specific endpoint.  we know the event category is 'meal-prep-delivery' and that the role is 'delivery'
    // we know, then, that the position (and route) ref is meal-prep-delivery-<<DD-MM_YYYY>>-delivery-<<route ref>> where org = 'cck'
    
    // The combination of cck, event category, and date should be unique for an event. If the database says that we're
    // doing multiple meal preps and deliveries in one day, we messed up.
     
    // Do we need to include role, or position information? Probably in the future, but not right now.
    // All that matters right now is that we can return route details based on date and route name
    
    // Example path: /route?date=03-02-2022&ref=arbury&passcode=ZHZW

    const query = req.query;
    const { date, ref, passcode } = query;

    if(passcode) {
        const gottenRoute = await prisma.route.findFirst({
            where: {
                OR: getDateFormats(date as string).map(dateFormat => {
                    return {
                        id_ref: [eventCategoryRef, dateFormat, eventRoleRef, ref].join('-')
                    };
                })
            },
            include: {
                route_delivery: {
                    orderBy: {
                        sequence: 'asc',
                    }
                },
                event_position: {
                    include: {
                        event: {
                            include: {
                                event_category: true
                            }
                        }
                    }
                },
            },
        });

        if(!gottenRoute) {
            return makeResponse(errorResponses.notFound, res);
        }

        if(gottenRoute.passcode !== passcode) {
            return makeResponse(errorResponses.invalidPasscode, res);
        }

        return res.status(200).json(cleanupRoute(gottenRoute));
    } else {
        return makeResponse(errorResponses.noPasscode, res);
    }
}

/**
 * Removes unneeded fields and changes field names to make the response more user-friendly
 */
function cleanupRoute(gottenRoute) {

    const response = new RouteResponse(gottenRoute);
    response['deliveries'] = gottenRoute.route_delivery.map( route => {
        return new RouteDeliveryResponse(route);
    });
    response['event'] = new EventResponse(gottenRoute.event_position.event);
    response['event']['category'] = new EventCategoryResponse(gottenRoute.event_position.event.event_category);

    return response;
}