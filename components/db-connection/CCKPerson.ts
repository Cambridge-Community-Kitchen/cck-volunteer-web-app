import { PersonDataInsert, PersonInsert } from "./Person";

export interface CCKPersonOrgData {
	nickname: string
}

export interface CCKPersonInsert extends PersonDataInsert, PersonInsert {
	addl_info: CCKPersonOrgData;
}

export interface CCKPerson extends CCKPersonInsert {
	id: number;
}
