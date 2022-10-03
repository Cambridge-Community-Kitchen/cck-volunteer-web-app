import { Person, SystemRole, Organization } from ".";
import { RecordIdentifier } from "./DBHelpers";


export interface PersonSystemRoleIdentifier extends RecordIdentifier {
	id?: number;

	//Role name or id
	id_role?: number;
	role?: string;
	
	//The person to which this role grant applies
	id_person?: number;
	id_person_ref?: string;
	
	// Optionally, the organization to which this role grant applies
	id_organization?: number;
	id_organization_ref?: string;
}

// To grant a role, we need to know the person, the role, and (optionally) to what organization this grant applies
export interface PersonSystemRoleInsert {
	person: Person.PersonIdentifier;
	role: SystemRole.SystemRoleIdentifier;
	organization?: RecordIdentifier;
}

export interface PersonSystemRole {
	organization?: Organization.Organization;
	person: Person.Person;
	system_role: SystemRole.SystemRole;
}