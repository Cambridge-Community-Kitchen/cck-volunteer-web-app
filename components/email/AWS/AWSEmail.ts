import * as AWS from "@aws-sdk/client-ses";
import util from 'util';

export default class AWSEmail {
	static async sendEmail({from, to, subject, body, region = process.env.APP_AWS_REGION}) {

		const credentials = {
			accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
		};

		// const AWS = (await import('@aws-sdk/client-ses'));

		const client = new AWS.SES({
			region: region,
			credentials: credentials
		});

		const params = {
			Destination: {
				ToAddresses: to
			},
			Message: {
				Body: {
					Text: {
						Charset: "UTF-8",
						Data: body
					}
				},
				Subject: {
					Charset: 'UTF-8',
					Data: subject
				}
			},
			Source: from,
		};

		const sendEmail = util.promisify(client.sendEmail).bind(client);
		await sendEmail(params);
	}
}