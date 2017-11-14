const logger = require('./logger');
const Connection = require('./Connection');
const mysql = require('mysql');

const escId = mysql.escapeId;
const esc = mysql.escape;
const _formWhere = (query) => Object.entries(query)
	.map(([key, value]) => `${escId(key)}=${esc(value)}`)
	.reduce((cond1, cond2) => `${cond1} AND ${cond2}`, 'TRUE');

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
				`SELECT * FROM ${escId(table)} WHERE ${_formWhere(query)};`
			);
			return records;

		} finally {
			await connection.end();	
		}
	}
}

module.exports = Restql;