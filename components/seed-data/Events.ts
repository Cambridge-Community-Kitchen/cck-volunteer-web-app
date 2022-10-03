import { Event } from "../db-connection";

/**
 * Helper funciton that adds days to a given date
 */
function addDays(date, days) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

/**
 * Returns a date in YYYY-MM-DD format, for uniquely identifying a day
 */
function toUniqueDayID(date: Date) {
	return date.toISOString().slice(0,10).replace(/\//g,"-");
}

/**
 * A 'typical' CCK event, containing various delivery routes
 */
function cckEventTemplate(date: Date, days: number): Event.EventInsert {
	const dayId = toUniqueDayID(addDays(date, days));
	const eventRef = `meal-prep-delivery-${dayId}`;

	return {
		id_ref: eventRef,
		organization: { id_ref: "cck" },
		event_category: { id_ref: "meal-prep-delivery" },
		name: "asdf",
		start_date: new Date(),
		event_role: [
			{
				id_ref: "delivery",
				name: "Delivery",
				description: "Delivery volunteers use their personal vehicle (typically a car or bicycle) to deliver meals to those in need.",
				event_position: [
					{
						id_ref: `cckmealdelivery-${dayId}-delivery-arbury`,
						name: "Arbury",
					}
				]
			},
			{
				id_ref: "cooking",
				name: "Cooking",
				description: "Cooking volunteers prepare the meal in CCK's kitchen."
			}
		]
	};
}

// Seed two weeks of upcoming events
const events: Event.EventInsert[] = [
	cckEventTemplate(new Date(), 3),
	cckEventTemplate(new Date(), 6),
	cckEventTemplate(new Date(), 10),
	cckEventTemplate(new Date(), 13)	
];

export default events;