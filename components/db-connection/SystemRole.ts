import { RecordIdentifier } from './DBHelpers';
import { PersonIdentifier } from './Person';
import { PersonSystemRole } from './PersonSystemRole';
import prisma from '@/components/db-connection-prisma';

export interface SystemRoleIdentifier {
	id?: number;
	role?: string;
}

/**
 * The 'core' system role data, the minimum data required to create a new system role in the database
 */
export interface SystemRoleDataInsert {
	role: string;
	description: string;
}

/**
 * To grant a user a given role, we need to know who is being granted the role, and (optionally) to which organization this grant applies
 */
export interface SystemRoleGrantInsert {
	person: PersonIdentifier;
	organization?: RecordIdentifier;
}

/**
 * The core system role data, enhanced with information on any grants that should be made upon insertion
 */
export interface SystemRoleInsert extends SystemRoleDataInsert {
	grants?: SystemRoleGrantInsert[];
}

/**
 * The system role data as returned from the database
 */
export interface SystemRole extends SystemRoleDataInsert {
	id: number;
	
	// The list of grants that are already associated with this system role, if any)
	person_system_role?: PersonSystemRole[]
}

/**
 * Builds a where clause for selecting a specific record; uses the record id
 * if available, and the unique reference string as a fallback
 */
 async function getUniqueSystemRoleWhereClause(systemRoleId: SystemRoleIdentifier) {
	
	const whereClause = { };
	if (systemRoleId.id) {
		whereClause['id'] = systemRoleId.id;
	} else {
		whereClause['role'] = systemRoleId.role;
	}

	return whereClause;
}

/**
 * Gets core system role data from more complex interfaces
 */
function systemRoleData(role: SystemRoleInsert): SystemRoleDataInsert {
	return {
		role: role.role,
		description: role.description
	};
}

/**
 * Creates an system role in the database, optionally linking it to one or more people
 */
 export async function create(role: SystemRoleInsert): Promise<SystemRole> {

	// TODO: allow creating a system role with grants
	/*let orgPerson = null;
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
	}*/

	const upsertData = {
		...systemRoleData(role),
	};

	return await prisma.system_role.upsert({
		where: { role: role.role },
		update: upsertData,
		create: upsertData
	});
}

/**
 * Deletes a system role from the database
 */
 export async function remove(role: SystemRoleIdentifier) {

	const where = await getUniqueSystemRoleWhereClause(role);

	await prisma.system_role.delete({
		where: where
	});
}