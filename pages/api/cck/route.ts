import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/components/db-connection-prisma';

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
     
    // Do we need to include event, role, or position information? Probably in the future, but not right now.
    // All that matters right now is that we can return route details based on date and route name
    
    // Example path: /route?date=03-02-2022&ref=arbury&passcode=ZHZW

    const query = req.query;
    const { date, ref, passcode } = query;

    if(passcode) {
        const routeRef = `meal-prep-delivery-${date}-delivery-${ref}`;

        const gottenRoute = await prisma.route.findFirst({
            where: {
                id_ref: routeRef,
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
            res.status(404).json({ result: "route not found" });
            return;
        }

        if(gottenRoute.passcode !== passcode) {
            res.status(403).json({ result: "Passcode is invalid" });
            return;
        }

        cleanupRoute(gottenRoute);
        
        res.status(200).json(gottenRoute);
    } else {
        res.status(403).json({ result: "For now, you MUST provide a passcode to access a route." });
    }
}

/**
 * Removes unneeded fields and changes field names to make the response more user-friendly
 */
function cleanupRoute(gottenRoute) {
    gottenRoute['deliveries'] = gottenRoute.route_delivery.map( route => {
        delete route.sequence;
        delete route.id;
        delete route.id_route;
        return route;
    });
    
    delete gottenRoute.route_delivery;
    delete gottenRoute.id;
    delete gottenRoute.id_ref;
    delete gottenRoute.id_event_position;
    delete gottenRoute.passcode;

    const eventCategory = gottenRoute.event_position.event.event_category;
    delete eventCategory.id;
    delete eventCategory.id_organization;
    delete eventCategory.id_ref;

    gottenRoute.event_position.event['category'] = eventCategory;

    delete gottenRoute.event_position.event.event_category;

    gottenRoute['event'] = gottenRoute.event_position.event;
    delete gottenRoute['event'].id;
    delete gottenRoute['event'].id_organization;
    delete gottenRoute['event'].id_event_category;
    delete gottenRoute['event'].id_ref;

    delete gottenRoute.event_position;
}