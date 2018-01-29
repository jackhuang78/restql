const logger = require('./logger');
const {createConnection, escapeId, escape} = require('mysql');

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
				`SELECT * FROM ${escapeId(table)}${whereStmt(query)};`
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
				`DELETE FROM ${escapeId(table)}${whereStmt(query)};`
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
				`INSERT INTO ${escapeId(table)}(${fields}) VALUES ${values};`
			);
		} finally {
			await connection.end();
		}
	}

	async put(table, entry, query) {
		const connection = this._connect();
		try {
			await connection.exec(
				`UPDATE ${escapeId(table)} SET ${formSetStmt(entry)}${whereStmt(query)};`
			);
		} finally {
			await connection.end();
		}
	}
}

function whereStmt(query) {
	if(Object.entries(query).length == 0) {
		return '';
	}

	const conditions = Object.entries(query)
		.map(([key, value]) => `${escapeId(key)}=${escape(value)}`)
		.join(' AND ');
	return ` WHERE ${conditions}`;
}

function formFieldsAndValuesStmt(entries) {
	const combinedEntries = entries.reduce(
		(entry1, entry2) => Object.assign({}, entry1, entry2));
	
	const fields = Object.keys(combinedEntries)
		.map(escapeId)
		.join(',');

	const values = entries
		.map(entry => Object.keys(combinedEntries)
			.map(field => escape(entry[field]))
			.join(','))
		.map(values => `(${values})`)
		.join(',');

	return [fields, values];
}

function formSetStmt(entry) {
	return Object.entries(entry)
		.map(([key, value]) => `${escapeId(key)}=${escape(value)}`)
		.join(',');
}


class Connection {
	constructor(host, user, password, database) {
		this.session = createConnection({
			host: host,
			user: user,
			password: password,
			database: database,
			multipleStatements: true,
		});
	}
	
	async exec(sql) {
		return new Promise((res, rej) => {
			logger.debug(`SQL> ${sql}`);
			this.session.query(sql, (err, rows, fields) => {
				return err ? rej(err) : res(rows);
			});
		});
	}

	async connect() {
		return new Promise((res, rej) => {
			this.session.connect((err) => {
				return err ? rej(err) : res();
			});
		});
	}

	async end() {
		return new Promise((res, rej) => {
			this.session.end((err) => {
				return err ? rej(err) : res();
			});
		});
	}
}

module.exports = Restql;