import { Organization, Person } from '@/components/db-connection';
import crypto from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { CCKPersonInsert } from '@/components/db-connection/CCKPerson';
import { Prisma } from '@prisma/client';

/**
 * Allows the user to register as a CCK volunteer
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	const reqBody = req.body as CCKPersonInsert;

	if (!reqBody.email || !reqBody.addl_info || !reqBody.addl_info.nickname) {
		res.status(400).json({ result: "Request body does not contain the requisite information"});
		return;
	}

	if (await Person.isPersonInOrg({email: reqBody.email}, "cck")) {
		res.status(400).json({ error: "User already exists"});
		return;
	}

	if (await Organization.hasPersonWithInfoProp({id_ref: "cck"}, "nickname", reqBody.addl_info.nickname)) {
		res.status(400).json({ error: "User with nickname already exists"});
		return;
	}

	const fullPerson: Person.PersonInsert = {
		email: reqBody.email,
		totpsecret: crypto.randomBytes(20).toString('hex'),
		organization: {
			"cck" : {
				addl_info: reqBody.addl_info as unknown as Prisma.JsonObject
			}
		}
	};

	await Person.create(fullPerson);

	res.status(200).json({ result: "User successfully created"});
}