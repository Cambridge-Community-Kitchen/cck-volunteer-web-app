import type { IncomingMessage }                 from 'http';
import { jwtVerify }                            from 'jose';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextRequest }                     from 'next/server';

const hasMappedHeaders = (headers: Headers | IncomingMessage['headers']): headers is Headers => headers instanceof Headers;

/* eslint-disable no-shadow, no-unused-vars */
export enum UserRole {
  MASTER_ADMIN = 'master-admin',
  EVENT_ADMIN = 'event-admin'
}
/* eslint-enable */

/**
 * Calculates the days since a provided date
 * This returns a positive number for dates more than ~24h in the past
 * and a negative number for dates more than ~24h in the future.
 */
export function daysSince(date: Date) {
  const t1 = date.getTime();
  const t2 = (new Date()).getTime();

  return Math.floor((t2 - t1) / (24 * 3600 * 1000));
}

/**
 * Parses a DD-MM-YYYY string into a date object
 *
 * @throws an error if the string is invalidly formatted or a valid date cannot be parsed
 */
export function parseDashedDate(date: string) {
  const parts = date.split('-');

  if (parts.length !== 3) {
    throw new Error('Invalid date format');
  }

  const parsedDate = new Date(parseInt(parts[2], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[0], 10));

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date format');
  }

  return parsedDate;
}

/**
 * Validates the JWT and retrieves the logged in user information
 */
export async function getUserContext(req: Request | IncomingMessage) {
  const token = getTokenFromRequest(req);

  const verified = await jwtVerify(
    token,
    new TextEncoder().encode(process.env.JWT_SS)
  );

  return verified.payload;
}

/**
 * Gets the JWT from the request (i.e., either from the authorization header or from a cookie)
 */
export function getTokenFromRequest(req: Request | IncomingMessage) {
  const isAPIRequest = !hasMappedHeaders(req.headers);
  const authHeader   = isAPIRequest ? (req as Request).headers.authorization : (req.headers as Headers).get('authorization');

  if (authHeader) {
    return authHeader.split(' ')[1];
  }

  return isAPIRequest ? (req as Request).cookies.AuthJWT : (req as IncomingMessage).cookies.get('AuthJWT');
}

/**
 * Parses a JWT without validating it (useful for debugging purposes)
 */
export function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

/**
 * Determines whether the user has one or more of the authorized roles to perform a given action
 */
export async function isUserAuthorized(req: NextApiRequest | NextRequest, res: NextApiResponse, authorizedRoles: string[], orgRef?: string) {
  try {
    const user = await getUserContext(req);

    const relevantRoles = orgRef === undefined ? user.roles : user.organizations[orgRef].roles;

    if (authorizedRoles.some(role => relevantRoles.indexOf(role) >= 0)) {
      return true;
    }

    if (process.env.DEBUG === 'true') {
      /* eslint-disable no-console */
      console.log('User does not have any of the authorized roles.');
      console.log(`User roles: ${  relevantRoles }`);
      console.log(`Authorized roles: ${  authorizedRoles }`);
      /* eslint-enable no-console */
    }

    return false;
  } catch (e) {
    if (process.env.DEBUG === 'true') {
      /* eslint-disable no-console */
      console.log('Error when attempting authorize user:');
      console.log(e);
      console.log(parseJwt(getTokenFromRequest(req)));
      /* eslint-enable no-console */
    }
  }

  return false;
}
