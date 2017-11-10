const expect = require('chai').expect;
const exec = require('promised-exec');
const Restql = require('./Restql');

describe('#Restql', () => {
	before(async () => {
		await exec('cat test/sakila-db/sakila-schema.sql test/sakila-db/sakila-data.sql | mysql -u root');
	});

	it('should be initialized', () => {

		//expect(new Restql()).to.be.not.null;
	});
});