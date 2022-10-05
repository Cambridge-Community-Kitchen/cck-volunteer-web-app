import prisma from '@/components/db-connection-prisma';
import { OrganizationPerson, OrganizationPersonData } from './OrganizationPerson';


/**
 * A set of fields which can be used to uniquely identify a person
 */
export interface PersonIdentifier {
	id?: number;
	email?: string;
}

/**
 * An object containing a key-value pair between the user's associated organization
 * ref (e.g., 'cck') and the user-specific organization data
 */
export interface PersonOrgsData {
	[orgRef: string]: OrganizationPersonData;
}


/**
 * The 'core' person data, common across all organizations
 */
export interface PersonDataInsert {
	email: string;
	totpsecret: string;
}

/**
 * The 'core' person data, as suitable for updating an existing record (i.e., most fields not required)
 */
export interface PersonDataUpdate {
	email?: string;
	totpsecret?: string;
}

/**
 * A simplified structure of a person and their associated orgazation data, suitable for use in API requests / responses
 */
 export interface PersonInsert extends PersonDataInsert {
	roles?: string[]
	organization?: PersonOrgsData
}

/**
 * A simplified structure of a person and their associated orgazation data, suitable for use in API requests / responses
 */
export interface PersonUpdate extends PersonDataUpdate {
	roles?: string[]
	organization?: PersonOrgsData
}

/**
 * Gets core person data from more complex person interfaces
 */
function personData(person: PersonInsert): PersonDataInsert {
	return {
		email: person.email,
		totpsecret: person.totpsecret
	};
}

export interface Person extends PersonDataInsert {
	id: number;
	organization_person?: OrganizationPerson[]
}

/**
 * Builds a where clause for selecting a specific record; uses the record id
 * if available, and the unique reference string as a fallback
 */
 async function getUniquePersonWhereClause(personId: PersonIdentifier) {
	
	const whereClause = { };
	if (personId.id) {
		whereClause['id'] = personId.id;
	} else {
		whereClause['email'] = personId.email;
	}

	return whereClause;
}

/**
 * Creates an person in the database, optionally linking it to one or more organizations
 */
export async function create(person: PersonInsert): Promise<Person> {

	let orgPerson = undefined;
	if (person.organization) {
		orgPerson = {
			create: Object.entries(person.organization).map(([orgRef, personOrgData]) => {
				return {
					organization: {
						connect: {
							id_ref: orgRef
						}
					},
					addl_info: personOrgData.addl_info
				};
			})
		};
	}

	let personSystemRole = undefined;
	if (person.roles) {
		personSystemRole = {
			create: person.roles.map( role => {
				return {
					system_role: {
						connect: {
							role: role
						}
					}	
				};			
			})
		};
	}

	const upsertData = {
		...personData(person),
		organization_person: orgPerson,
		person_system_role: personSystemRole
	};

	return await prisma.person.upsert({
		where: { email: person.email },
		update: upsertData,
		create: upsertData
	});
}

/**
 * Deletes a person from the database
 */
export async function remove(person: PersonIdentifier) {

	const where = await getUniquePersonWhereClause(person);

	await prisma.person.delete({
		where: where
	});
}

export interface GetPersonParams {
	person: PersonIdentifier;
	includeOrgs?: boolean;
	includeEvents?: boolean;
	includeRoles?: boolean;
}

/**
 * Gets a unique person from the database, optionally including the user's organizations and each organization's events
 */
export async function get({
	person,
	includeOrgs = true,
	includeEvents = false,
	includeRoles = false,
	}: GetPersonParams): Promise<Person> {


	const where = await getUniquePersonWhereClause(person);

	const include = {};
	if (includeOrgs || includeEvents) {
		include['organization_person'] = {
			include: {
				organization: {
					include: {
						event: includeEvents
					}
				},	
			}
		};
	}

	if (includeRoles) {
		include['person_system_role'] = {
			include: {
				system_role: true
			}
		};
	}

	return await prisma.person.findUnique({
		where: where,
		include: include
	});
}

/**
 * Transforms the raw person data coming back from Prisma into a more user-/API-friendly format
 */
export function makeAPIFriendly(person: Person): PersonUpdate {

	const response: PersonUpdate = {
		...personData(person)
	};
	delete response.totpsecret;
	
	if (person.organization_person) {
		response.organization = {};
		person.organization_person.map( personOrg => {
			response.organization[personOrg.organization.id_ref] = {
				addl_info: personOrg.addl_info
			};
		});
	}

	return response;
}

/**
 * Gets a streamlined list of the user's organizations and any org-specific user data
 */
export async function getPersonOrgDetail(person: PersonIdentifier): Promise<PersonOrgsData> {
	
	const gottenPerson = await get({person});
	const streamlinedPerson = makeAPIFriendly(gottenPerson);

	return streamlinedPerson.organization;
}

/**
 * Determines whether or not a given person is a member of a particular org
 */
export async function isPersonInOrg(person: PersonIdentifier, orgRef: string): Promise<boolean> {
	
	const personOrgs = await get({person});

	if (!personOrgs) {
		return false;
	}

	const matchingOrgs = personOrgs.organization_person.filter(orgPos => orgPos.organization.id_ref === orgRef);
	return matchingOrgs.length > 0;
}