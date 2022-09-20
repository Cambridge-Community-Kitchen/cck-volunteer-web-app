import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextRequest } from 'next/server';
import type { IncomingMessage } from 'http';
import { jwtVerify } from 'jose';

const hasMappedHeaders = (headers: Headers | IncomingMessage['headers']): headers is Headers => {
    return headers instanceof Headers;
};

export enum UserRole {
    MASTER_ADMIN = 'master-admin',
    EVENT_ADMIN = 'event-admin'
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
    const authHeader = isAPIRequest ? (req as Request).headers['authorization'] : (req.headers as Headers).get('authorization');

    if (authHeader) {
        return authHeader.split(" ")[1];
    } else {
        return isAPIRequest ? (req as Request)['cookies']['AuthJWT'] : (req as IncomingMessage)['cookies'].get("AuthJWT");
    }
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

        const relevantRoles = orgRef == undefined ? user['roles'] : user['organizations'][orgRef]['roles'];

        for (const role in authorizedRoles) {
            if (relevantRoles.indexOf(authorizedRoles[role]) >= 0) {
                return true;
            }
        }

        if (process.env.DEBUG === "true") {
            console.log("User does not have any of the authorized roles.");
            console.log("User roles: " + relevantRoles);
            console.log("Authorized roles: " + authorizedRoles);
        }

        return false;
    } catch (e) {
        if (process.env.DEBUG === "true") {
            console.log("Error when attempting authorize user:");
            console.log(e);
            console.log(parseJwt(getTokenFromRequest(req)));
        }
    }

    return false;
}