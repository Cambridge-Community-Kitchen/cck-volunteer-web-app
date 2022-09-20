import { totp } from 'otplib';
import { DBConnection } from '@/components/db-connection';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import type { NextApiRequest, NextApiResponse } from 'next';


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
	const data = await DBConnection.getUserByEmail(body.email);
	if (data.length == 1) {
		const person = data[0];

		totp.options = { window: 5 };
		const isValid = totp.check(body.totp, person.totpsecret);
		
		if (isValid) {
			const {...personn} = person;
			delete personn.totpsecret;

			const roles = await DBConnection.getUserRoles(person.id);
			const wholePerson = {...personn, ...roles};
			
			const token = await new SignJWT(wholePerson)
				.setProtectedHeader({ alg: 'HS256' })
				.setJti(nanoid())
				.setIssuedAt()
				.setExpirationTime('4h')
				.sign(new TextEncoder().encode(process.env.JWT_SS));

			const responseBody = { result: "User successfully authenticated", jwt: token, user: wholePerson };
			if (process.env.DEBUG === "true") {
				console.log(responseBody);
			}

			res.status(200).json(responseBody);
		} else {
			res.status(401).json({ result: "Invalid email or totp code" });
		}
	} else {
		res.status(401).json({ result: "Invalid email or totp code" });
	}
}