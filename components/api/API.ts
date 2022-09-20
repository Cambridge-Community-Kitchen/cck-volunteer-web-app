const defaultHeaders = Object.freeze({
    Accept: 'application/json',
    'Content-Type': 'application/json',
});

const endpoints = Object.freeze({
    totpRequest: "/api/auth/totp/request",
    totpValidate: "/api/auth/totp/validate",
    registerUser: "/api/auth/register",
    getRouteData: "/api/cck/route"
});

/**
 * Makes an HTTP request to the request OTP endpoint
 */
export async function requestOTP({baseURL, email}) {
	
	const endpointUrl = baseURL + endpoints.totpRequest;
	const settings = {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({email: email})
    };
	return await fetch(endpointUrl, settings);
}

/**
 * Makes an HTTP request to the validate OTP endpoint
 */
export async function validateOTP({baseURL, email, otp}) {
    
    const endpointUrl = baseURL + endpoints.totpValidate;
    const settings = {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({email: email, totp: otp})
    };
    return await fetch(endpointUrl, settings);
}

/**
 * Makes an HTTP request to the register user endpoint
 */
export async function registerUser({baseURL, email, nickname}) {
    
    const endpointUrl = baseURL + endpoints.registerUser;
    const settings = {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({email: email, nickname: nickname})
    };
    return await fetch(endpointUrl, settings);
}

/**
 * Makes an HTTP request to cck's route endpoint
 */
export async function getRouteData({basePath, date, ref, passcode, mode}) {
    const url = new URL(basePath);
    url.pathname += endpoints.getRouteData;
    url.searchParams.append("date", date);
    url.searchParams.append("ref", ref);
    url.searchParams.append("passcode", passcode);
    url.searchParams.append("mode", mode);

    return await fetch(url.href);
}