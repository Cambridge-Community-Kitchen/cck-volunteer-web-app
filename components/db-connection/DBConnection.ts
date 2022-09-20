import mysql from 'mysql';
import util from 'util';
import SQL from 'sql-template-strings';
import * as fs from 'fs';

const dbConfig = {
    connectionLimit : 100, //important
    host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
};

if (process.env.NO_DB_SSL !== "true" && process.env.DB_HOST.includes('aws.com')){
	dbConfig['ssl'] = {
		ca : fs.readFileSync(process.cwd() + "/aws/eu-west-2-bundle.pem")
	};
}

const dbPool = mysql.createPool(dbConfig);

/**
 * Helper function for building promise-based database queries
 */
async function asyncQuery(qString) {
	const query = util.promisify(dbPool.query).bind(dbPool);
	return await query(qString);
}

/**
 * Gets user's system and organization roles from the database
 */
export async function getUserRoles(personId: number) {

	const qString = SQL`
		SELECT system_role.role as role, organization.id_ref AS 'orgRef' FROM person
		INNER JOIN person_system_role ON person.id = person_system_role.id_person
		INNER JOIN system_role ON system_role.id = person_system_role.id_role
		LEFT JOIN organization ON organization.id = person_system_role.id_organization
		WHERE person.id = ${personId}
	`;
	
	const response = {};
	const rows = await asyncQuery(qString);

	response['roles'] = rows.filter(row => row.orgRef == null)
						.map((row) => row.role);

	const orgRoles = rows.filter(row => row.orgRef !== null);
	const a = orgRoles.map(row => row.orgRef);
	const orgRefs = a.filter((item, i, ar) => ar.indexOf(item) === i);

	for (const i in orgRefs) {
		if (!response['organizations']) { response['organizations'] = {}; }
		const org = {};
		org['roles'] = rows.filter(row => row.orgRef == orgRefs[i])
						.map((row) => row.role);
		response['organizations'][orgRefs[i]] = org;
	}

	return response;
}

/**
 * Gets a unique user from the database by email address
 */
export async function getUserByEmail(email) {
	const qString = SQL`SELECT * FROM person WHERE email = ${email}`; 
	return await asyncQuery(qString);
}

/**
 * Gets a unique user from the database by email address or nickname
 */
 export async function getUserByEmailorNickname(email, nickname) {
	const qString = SQL`SELECT * FROM person WHERE (email = ${email} OR nickname = ${nickname} )`; 
	return await asyncQuery(qString);
}

/**
 * Creates a user in the database
 */
 export async function createUser({email, totpsecret, nickname}) {
	const qString = SQL`INSERT INTO person(email, totpsecret, nickname) VALUES(${email}, ${totpsecret}, ${nickname})`; 
	return await asyncQuery(qString);
}