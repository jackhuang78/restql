const expect = require('chai').expect;
const exec = require('promised-exec');
const Restql = require('./Restql');

describe('#Restql', () => {
	before(async () => {
		await exec('cat \
			test/sakila-db/sakila-schema.sql \
			test/sakila-db/sakila-data.sql \
			| mysql -u root');
	});

	describe('#get', () => {
		it('should read record by id', async () => {
			const restql = new Restql('localhost', 'root', '', 'sakila');
			const film = await restql.get('film', 2);
			expect(film).to.be.not.null;
			expect(film.film_id).to.equal(2);
		});
	});
});