const logger = require('./logger');
const Connection = require('./Connection');

class Restql {
	constructor(host, user, password, database) {
		this.connection = new Connection(host, user, password, database);
	}

	async get(table, id) {
		await this.connection.connect();
		try {
			const records = await this.connection.exec(
				`SELECT * FROM ${table} WHERE film_id=${id};`
			);
			return (records.length == 0) ? null : records[0];

		} finally {
			await this.connection.end();	
		}
	}
}

module.exports = Restql;