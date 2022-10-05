import { Prisma } from '@prisma/client';
import type { RecordIdentifier } from './DBHelpers';
import { getReference } from './DBHelpers';
import prisma from '@/components/db-connection-prisma';
import { Organization } from './Organization';
import { Person } from './Person';

export interface OrganizationPersonIdentifier extends RecordIdentifier {
	id_organization?: number;
	id_organization_ref?: string;
	id_person?: number;
	id_person_ref?: string;
}

export interface OrganizationPersonData {
    addl_info?: Prisma.JsonValue;
}

export interface OrganizationPersonInsert extends OrganizationPersonData {
	organization: RecordIdentifier
	person: RecordIdentifier
}

/**
 * Gets core org person data from more complex interfaces
 */
function orgPersonData(orgPerson: OrganizationPersonInsert): OrganizationPersonData {
	return {
		addl_info: orgPerson.addl_info
	};
}

export interface OrganizationPerson extends OrganizationPersonData {
	id: number;
	id_organization: number;
	id_person: number;
	organization?: Organization;
	person?: Person;
}

/**
 * Creates an organization-person relationship in the database
 */
 export async function create(orgPerson: OrganizationPersonInsert): Promise<OrganizationPerson> {
	
	const orgId = getReference({
		id: orgPerson.organization.id,
		id_ref: orgPerson.organization.id_ref
	});
	
	const personId = getReference({
		id: orgPerson.person.id,
		id_ref: orgPerson.person.id_ref
	});

	return await prisma.organization_person.create({
		data: {
			...orgPersonData(orgPerson),
			organization: {
				connect: {
					[orgId[0]]: orgId[1]
				}
			},
			person: {
				connect: {
					[personId[0]]: personId[1]
				}
			}
		}
	});
}

/**
 * Gets an organization person from the database using ids
 */
 export async function get(orgPerson: OrganizationPersonInsert): Promise<OrganizationPerson> {
	
	return await prisma.organization_person.findUnique({
		where: {
			organization_person: {
				id_person: orgPerson.person.id,
				id_organization: orgPerson.organization.id
			}
		}
	});
}