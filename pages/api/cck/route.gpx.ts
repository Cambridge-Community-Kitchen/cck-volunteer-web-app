import { Client, DirectionsRequest, TravelMode, GeocodeRequest, LatLng } from '@googlemaps/google-maps-services-js';
import type { NextApiRequest, NextApiResponse }                          from 'next';
import polyUtil                                                          from 'polyline-encoded';
import { daysSince, parseDashedDate }                                    from '@/components/api-helpers';
import prisma                                                            from '@/components/db-connection-prisma';
import { findLocation }                                                  from '@/components/google-maps-api';

/**
 * Generates a gpx from route data
 *
 * @param {NextApiRequest} req The Next.js API request
 * @param {NextApiResponse} res The Next.js API response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query                   = req.query;
  const { date, ref, passcode } = query;

  let { mode } = query;

  mode = mode || 'bicycling';

  let parsedDate: Date;

  try {
    parsedDate = parseDashedDate(date as string);
  } catch (error) {
    res.status(400).json({ result: 'invalid date' });

    return;
  }

  const daysDiff = daysSince(parsedDate);

  // Do not return route data if the delivery date is more than a day ago
  if (daysDiff > 1) {
    res.status(404).json({ result: 'route not found' });
  } else if (passcode) {
    const routeRef = `meal-prep-delivery-${ date }-delivery-${ ref }`;

    const gottenRoute = await prisma.route.findFirst({
      where: {
        id_ref: routeRef,
      },
      include: {
        route_delivery: {
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });

    if (!gottenRoute) {
      res.status(404).json({ result: 'Route not found' });

      return;
    }

    if (gottenRoute.passcode !== passcode) {
      res.status(403).json({ result: 'Passcode is invalid' });

      return;
    }

    const client                  = new Client({});
    const request: GeocodeRequest = {
      params: {
        address : 'The Lockon, Fair Street, Cambridge',
        key     : process.env.GOOGLE_MAPS_API_KEY,
      },
    };

    const geoResponse = await client.geocode(request);
    const lockon      = geoResponse.data.results[0].geometry.location;

    const waypoints: LatLng[] = [];

    // TODO: follow the style guide instead of suspending it here
    // eslint-disable-next-line guard-for-in
    for (const deliveryIdx in gottenRoute.route_delivery) {
      let a = gottenRoute.route_delivery[deliveryIdx].plus_code;

      if (a.length <= 13 && a.includes('+')) { // then it's a PlusCode
        if (a.indexOf('+') === 4) {
          a = `9f42${ a }`;
        }
      }

      if (a.length > 0) {
        const loc = await findLocation(a);

        waypoints.push(loc.candidates[0].geometry.location);
      }
    }

    const directionsRequest: DirectionsRequest = {
      params: {
        origin      : lockon,
        destination : lockon,
        mode        : TravelMode[<string>mode],
        optimize    : true,
        waypoints   : waypoints,
        key         : process.env.GOOGLE_MAPS_API_KEY,
      },
    };

    const dirResponse = await client.directions(directionsRequest);
    const latlngs     = polyUtil.decode(dirResponse.data.routes[0].overview_polyline.points);

    let gpx = '<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="Cambridge Community Kitchen - https://cckitchen.uk" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/1" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"><trk><trkseg>';

    // TODO: follow the style guide instead of suspending it here
    // eslint-disable-next-line guard-for-in
    for (const tupleIdx in latlngs) {
      gpx = `${ gpx }<trkpt lat="${ latlngs[tupleIdx][0] }" lon="${ latlngs[tupleIdx][1] }"/>`;
    }

    gpx = `${ gpx }</trkseg></trk></gpx>`;

    res.setHeader('Content-Type', 'application/gpx+xml').status(200).write(gpx);
    res.end();
  } else {
    res.status(403).json({ result: 'For now, you MUST provide a passcode to access a route.' });
  }
}
