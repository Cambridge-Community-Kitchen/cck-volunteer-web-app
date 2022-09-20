import AWSEmail from './AWS';

/**
 * Template for the OTP email
 */
function otpEmailBody(otp: string): string {
	return `Hello,\n\nWe received a request to log in to the CCK volunteer app.\n\n${otp}\n\nEnter this code on the login screen to confirm your identity.\n\nThanks,\nApp Administrators`;
}

export const EMAIL_PROVIDER = Object.freeze({
	aws: "AWS"
});

/**
 * Gets the email sending service (defaults to AWS)
 */
function getEmailSender(provider: string) {
	switch (provider) {
		case EMAIL_PROVIDER.aws:
		default:
			return AWSEmail;
	}
}

/**
 * Sends an email containing a one-time password for purposes of two-factor authentication
 */
export async function sendOTP({otp, email, provider = EMAIL_PROVIDER.aws}) {
	
	const sender = getEmailSender(provider);
	await sender.sendEmail({
		from: 'admin@cckitchen-app.uk',
		to: [email],
		subject: 'CCK verification code',
		body: otpEmailBody(otp)
	});
}