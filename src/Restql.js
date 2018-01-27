const logger = require('./logger');
const mysql = require('mysql');

const escId = mysql.escapeId;
const esc = mysql.escape;

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
				`SELECT * FROM ${escId(table)} WHERE ${formWhereStmt(query)};`
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
				`DELETE FROM ${escId(table)} WHERE ${formWhereStmt(query)};`
			);
			return result;
		} finally {
			await connection.end();
		}
	}

	async post(table, entries) {
		const connection = this._connect();
		try {
			const [fields, values] = formFieldsAndValuesStmt(entries);
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
				`UPDATE ${escId(table)} SET ${formSetStmt(entry)} WHERE ${formWhereStmt(query)};`
			);
		} finally {
			await connection.end();
		}
	}
}

class Connection {
	constructor(host, user, password, database) {
		this.mysqlConnection = mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database,
			multipleStatements: true,
		});
	}
	
	async exec(sql) {
		return new Promise((res, rej) => {
			logger.info(`SQL> ${sql}`);
			this.mysqlConnection.query(sql, (err, rows, fields) => {
				return err ? rej(err) : res(rows);
			});
		});
	}

	async connect() {
		return new Promise((res, rej) => {
			this.mysqlConnection.connect((err) => {
				return err ? rej(err) : res();
			});
		});
	}

	async end() {
		return new Promise((res, rej) => {
			this.mysqlConnection.end((err) => {
				return err ? rej(err) : res();
			});
		});
	}
}

function formWhereStmt(query) {
	return Object.entries(query)
		.map(([key, value]) => `${escId(key)}=${esc(value)}`)
		.reduce((cond1, cond2) => `${cond1} AND ${cond2}`, 'TRUE');
}

function formFieldsAndValuesStmt(entries) {
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

module.exports = Restql;