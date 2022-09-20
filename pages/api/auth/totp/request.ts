import { totp } from 'otplib';
import { DBConnection } from '@/components/db-connection';
import { sendOTP } from '@/components/email';
import type { NextApiRequest, NextApiResponse } from 'next';


interface EmailRequestBody {
	email: string;
}

/**
 * Accepts a request for a TOTP token, to be sent to email or phone
 * 
 * @param {NextApiRequest} req The Next.js API request
 * @param {NextApiResponse} res The Next.js API response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	const body: EmailRequestBody = req.body;
	const data = await DBConnection.getUserByEmail(body.email);

	if (data.length == 1) {
		const person = data[0];
		const token = totp.generate(person.totpsecret);
		
		const response = { result: "Email dispatched" };

		if(process.env.SEND_EMAIL || !(process.env.DEBUG === "true")) {
			await sendOTP({otp: token, email: person.email});
		} else {
			console.log(`OTP requested for ${person.email}: ${token}`);
			response.result = "OTP printed to console";
		}
		
		res.status(200).json(response);
	} else {
		res.status(404).json({ result: "User unknown" });
	}
}

/*

// Demonstrates consumption of graphcms endpoints, kept for future reference

export default function handler(req, res) {

	var graphcmsToken = process.env.GRAPHCMS_AUTH_TOKEN

	const graphcms = new GraphQLClient(process.env.GRAPHCMS_URL, {
    	headers: {
    		authorization: 'Bearer ' + graphcmsToken,
    	},
  	});

	return new Promise((resolve, reject) => {
		graphcms.request(`
		{	
			person(where: {email: "cck@agolden.com"}) {
				sha1
			}
		}
		`).then(data => {
			
			if (data.person !== null) {
				const token = authenticator.generate(data.person.sha1);
				console.log(token)
			} else {
        		console.log("Email not found")
			}

			res.status(200).json({ result: "Email dispatched if known" });
			resolve();
		});
	});
}*/

