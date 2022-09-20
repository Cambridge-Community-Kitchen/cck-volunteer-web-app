const googleBaseUrl = "https://maps.googleapis.com/maps/api";

/**
 * Uses the Google Maps API to fetch information about a given location (e.g., geographic coordinates)
 * 
 * @param {string} location The location / address to be located
 * @returns {object} The search results matching the provided location
 */
export async function findLocation(location: string) {
	
    const url = new URL(googleBaseUrl);
    url.pathname += '/place/findplacefromtext/json';
    url.searchParams.append("input", location);
    url.searchParams.append("inputtype", "textquery");
    url.searchParams.append("key", process.env.GOOGLE_MAPS_API_KEY);
    url.searchParams.append("fields", "formatted_address,geometry");
    
    const response = await fetch(url.href);
    return response.json();
}