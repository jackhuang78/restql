const mysql = require('mysql');
const logger = require('./logger');

class Connection {
	constructor(host, user, password, database) {
		this.connection = mysql.createConnection({
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
			this.connection.query(sql, (err, rows, ignore) => {
				return err ? rej(err) : res(rows);
			});
		});
	}

	async connect() {
		return new Promise((res, rej) => {
			this.connection.connect((err) => {
				return err ? rej(err) : res();
			});
		});
	}

	async end() {
		return new Promise((res, rej) => {
			this.connection.end((err) => {
				return err ? rej(err) : res();
			});
		});
	}
}

module.exports = Connection;