import type { NextApiRequest, NextApiResponse } from 'next';
import { Event, EventPosition, EventRole, Route, RouteDelivery } from '@/components/db-connection';
import { isUserAuthorized, UserRole } from '@/components/api-helpers';

type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];
/**
 * Helper method for preserving type when iterating
 */
function ObjectEntries<T extends object>(t: T): Entries<T>[] {
  return Object.entries(t) as Entries<T>[];
}

/**
 * Batch upload of an event and all its roles and positions
 * 
 * @param {NextApiRequest} req The Next.js API request
 * @param {NextApiResponse} res The Next.js API response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if (req.method === 'POST') {
        const event = req.body;
    
        if (! (await isUserAuthorized(req, res, [UserRole.MASTER_ADMIN]) || await isUserAuthorized(req, res, [UserRole.EVENT_ADMIN], 'cck'))) {
            res.status(403).json({ result: "You must be a master administrator or an events admin for cck to batch upload event data." });
            return;
        }

        // Update the event
        let gottenEvent = await Event.get(event);
        if(gottenEvent) {
            // Event found, perform an update
            const eventForUpdate = JSON.parse(JSON.stringify(event));
            delete eventForUpdate.roles;
            await Event.update(eventForUpdate);
            gottenEvent = {...gottenEvent, ...eventForUpdate};
        } else {
            // Event not found, perform an insert
            const eventForCreate = JSON.parse(JSON.stringify(event));
            delete eventForCreate.roles;
            gottenEvent = await Event.create(eventForCreate);
        }
        
        // Update event roles
        // If no roles exist, insert them all.
        // If roles DO exist, we don't want to delete the event role... UNLESS that event role no longer exists in the upload

        if (event.roles) {
            
            // Delete any roles that are not provided in the upload
            EventRole.deleteRolesNotInRefs(gottenEvent, Object.keys(event.roles));

            // Iterate over the roles, inserting roles where necessary
            for (const [eventRoleKey, eventRole] of ObjectEntries(event.roles)) {
                const eventRoleId = {
                    id_event: gottenEvent.id,
                    id_ref: eventRoleKey
                };

                let gottenEventRole = await EventRole.get(eventRoleId);
                if (gottenEventRole) {
                    const eventRoleForUpdate = {...gottenEventRole, ...eventRole};
                    delete eventRoleForUpdate.positions;
                    await EventRole.update(eventRoleForUpdate);
                    gottenEventRole = {...gottenEventRole, ...eventRoleForUpdate};
                } else {
                    const insertEventRole = {...eventRoleId, ...eventRole};
                    delete insertEventRole.positions;
                    gottenEventRole = await EventRole.create(insertEventRole);
                }

                if (eventRole['positions']) {

                    EventPosition.deletePositionsNotInRefs(gottenEvent, Object.keys(eventRole['positions']));
                    
                    for (const [positionKey, position] of  ObjectEntries(eventRole['positions'])) {
                        
                        const eventPositionId = {
                            id_event: gottenEvent.id,
                            id_ref: positionKey
                        };
                        
                        let gottenEventPosition = await EventPosition.get(eventPositionId);

                        if(gottenEventPosition) {
                            const eventPositionForUpdate = {...gottenEventPosition, ...position};
                            delete eventPositionForUpdate.route;
                            await EventPosition.update(eventPositionForUpdate);
                            gottenEventPosition = {...gottenEventPosition, ...eventPositionForUpdate};

                            await Route.removeForPosition(gottenEventPosition.id);

                        } else {
                            const insertEventPosition = {...eventPositionId, ...position};
                            insertEventPosition.id_event_role = gottenEventRole.id;
                            delete insertEventPosition.route;
                            gottenEventPosition = await EventPosition.create(insertEventPosition);
                        }

                        if(position['route']) {
                            
                            const routeInsert = {...position['route']};
                            delete routeInsert.deliveries;
                            routeInsert['id_ref'] = gottenEventPosition.id_ref;
                            routeInsert['id_event_position'] = gottenEventPosition.id;

                            const gottenRoute = await Route.create(routeInsert);
                            
                            for (const deliveryIdx in position['route']['deliveries']) {
                                const deliveryInsert = position['route']['deliveries'][deliveryIdx];
                                deliveryInsert['id_route'] = gottenRoute.id;
                                deliveryInsert['sequence'] = parseInt(deliveryIdx);
                                await RouteDelivery.create(deliveryInsert);

                            }
                        }
                    }
                }
            }
        }
        res.status(200).json({ result: "Event data successfully imported." });
        return;
    }

    res.status(400).json({ result: "This endpoint does not allow this request method." });
}