import { DBConnection } from '@/components/db-connection';
import crypto from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * this is a test
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	const body = req.body;
	if (body.email == null || body.nickname == null) {
		res.status(400).json({ error: "Missing required fields"});
		return;
	}

	const data = await DBConnection.getUserByEmailorNickname(body.email, body.nickname);
	if (data.length > 0) {
		res.status(400).json({ error: "User or nickname already exists"});
		return;
	}

	const randomSecret = crypto.randomBytes(20).toString('hex');
	await DBConnection.createUser({email: body.email, totpsecret: randomSecret, nickname: body.nickname});
	res.status(200).json({ result: "User successfully created"});
}