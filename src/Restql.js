const logger = require('./logger');
const Connection = require('./Connection');
const mysql = require('mysql');

const escId = mysql.escapeId;
const esc = mysql.escape;

function formWhere(query) {
	return Object.entries(query)
		.map(([key, value]) => `${escId(key)}=${esc(value)}`)
		.reduce((cond1, cond2) => `${cond1} AND ${cond2}`, 'TRUE');
}

function formFieldsAndValues(entries) {
	const combinedEntries = entries.reduce(
		(entry1, entry2) => Object.assign({}, entry1, entry2));
	
	const fields = Object.keys(combinedEntries)
		.map(escId)
		.join(',');

	const values = entries
		.map((entry) => Object.keys(combinedEntries)
			.map((field) => entry[field])
			.map(esc)
			.join(','))
		.join('),(');

	return [fields, values];
}

function formSetStmt(entry) {
	return Object.entries(entry)
		.map(([key, value]) => `${escId(key)}=${esc(value)}`)
		.join(',');
}

class Restql {
	constructor(host, user, password, database) {
		this.host = host;
		this.user = user;
		this.password = password;
		this.database = database;
	}

	_connect() {
		return new Connection(this.host, this.user, this.password, this.database);
	}

	async get(table, query) {
		const connection = this._connect();
		try {
			const records = await connection.exec(
				`SELECT * FROM ${escId(table)} WHERE ${formWhere(query)};`
			);
			return records;

		} finally {
			await connection.end();	
		}
	}

	async delete(table, query) {
		const connection = this._connect();
		try {
			const result = await connection.exec(
				`DELETE FROM ${escId(table)} WHERE ${formWhere(query)};`
			);
			return result;
		} finally {
			await connection.end();
		}
	}

	async post(table, entries) {
		const connection = this._connect();
		try {
			const [fields, values] = formFieldsAndValues(entries);
			await connection.exec(
				`INSERT INTO ${escId(table)}(${fields}) VALUES (${values});`
			);
		} finally {
			await connection.end();
		}
	}

	async put(table, entry, query) {
		const connection = this._connect();
		try {
			await connection.exec(
				`UPDATE ${escId(table)} SET ${formSetStmt(entry)} WHERE ${formWhere(query)};`
			);
		} finally {
			await connection.end();
		}
	}
}

module.exports = Restql;