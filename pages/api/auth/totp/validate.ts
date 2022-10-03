import { totp } from 'otplib';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Person } from '@/components/db-connection';

interface EmailRequestBody {
	email?: string;
	totp: string;	
}

/**
 * Accepts a request for TOTP token validation, to complete two-factor authentication
 * 
 * @param {NextApiRequest} req The Next.js API request
 * @param {NextApiResponse} res The Next.js API response
 */
 export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	const body: EmailRequestBody = req.body;

	const person = await Person.get({ person: {
		email: body.email
	}, includeRoles: true });

	// We need to find a matching user to continue
	if (!person) {
		res.status(401).json({ result: "Invalid email or totp code" });
		return;
	}

	totp.options = { window: 5 };
	const isValid = totp.check(body.totp, person.totpsecret);

	// OTP must be valid
	if (!isValid) {
		res.status(401).json({ result: "Invalid email or totp code" });
		return;
	}

	const personResponse = {...Person.makeAPIFriendly(person)};
	
	const token = await new SignJWT(personResponse)
		.setProtectedHeader({ alg: 'HS256' })
		.setJti(nanoid())
		.setIssuedAt()
		.setExpirationTime('6h')
		.sign(new TextEncoder().encode(process.env.JWT_SS));

	const responseBody = { result: "User successfully authenticated", jwt: token, user: person };
	if (process.env.DEBUG === "true") {
		console.log(responseBody);
	}

	res.status(200).json(responseBody);
}