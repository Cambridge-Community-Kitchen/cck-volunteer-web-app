import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import { isUserAuthorized, UserRole } from '@/components/api-helpers';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Generates a long-lived token for secure applications, e.g., 
 * to be used by server-side service accounts
 */
export default async function generateLongLivedToken(req: NextApiRequest, res: NextApiResponse) {

	/**
	 * Only master administrators should be able to issue service accounts, 
	 * as such service accounts often have wide-ranging access.
	 */
	if (await isUserAuthorized(req, res, [UserRole.MASTER_ADMIN])) {
		
		// By default, long lived tokens should expire after 1 year 
		const expiration = req.body.expiration ? req.body.expiration : '365d';

		// The roles that the service account should be able to assume
		const serviceAccount = {
			roles: req.body.roles,
			organizations: req.body.organizations
		};

		const token = await new SignJWT(serviceAccount)
			.setProtectedHeader({ alg: 'HS256' })
			.setJti(nanoid())
			.setIssuedAt()
			.setExpirationTime(expiration)
			.sign(new TextEncoder().encode(process.env.JWT_SS));

		res.status(200).json({ result: "Long-lived token created", jwt: token });
	} else {
		res.status(403).json({ result: "User not authorized." });
	}
}