import { OrganizationInsert } from "../db-connection/Organization";

interface OrgKVP {
	[orgRef: string]: OrganizationInsert;
}
const organizations: OrgKVP = {
	cck: {
		id_ref: 'cck',
		name: 'Cambridge Community Kitchen',
		description: 'Cambridge Community Kitchen is a food solidarity collective dedicated to tackling food poverty in Cambridge.',
		event_category: [
			{
				id_ref: "meal-prep-delivery",
				name: "Meal prep & delivery",
				description: "Several times a week, CCK prepares and delivers free, hot, plant-based meals to those who need them."
			}
		]
	}
};

export default organizations;