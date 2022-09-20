/**
 * Returns authentication failure
 */
export default async function handler(req, res) {
	res.status(401).json({ result: "Authentication required" });
}