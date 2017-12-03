const chai = require('chai');
const chai_also = require('chai-also');
const exec = require('promised-exec');
const Restql = require('./Restql');

chai.use(chai_also);
const expect = chai.expect;

describe('#Restql', () => {
	before(async function() {
		// Database initialization takes a while
		this.timeout(40000);
		await exec('cat \
			test/sakila-db/sakila-schema.sql \
			test/sakila-db/sakila-data.sql \
			| mysql -u root');
	});

	let restql;
	beforeEach(() => {
		restql = new Restql('localhost', 'root', '', 'sakila');
	}); 

	describe('#get', () => {
		it('should read a record by querying int', async () => {
			const films = await restql.get('film', {film_id: 2});
			expect(films).to.have.lengthOf(1);
			expect(films[0]).to
				.have.property('film_id', 2)
				.and.also.property('title', 'ACE GOLDFINGER');
		});

		it('should read a record by querying string', async () => {
			const films = await restql.get('film', {title: 'ACE GOLDFINGER'});
			expect(films).to.have.lengthOf(1);
			expect(films[0]).to
				.have.property('film_id', 2)
				.and.also.property('title', 'ACE GOLDFINGER');

		});

		it('should fail to read a non-existing record', async () => {
			const films = await restql.get('film', {film_id: -1});
			expect(films).to.have.lengthOf(0);
		});

		it('should read multiple records by query', async () => {
			const films = await restql.get('film', {release_year: 2006});
			expect(films).to.have.lengthOf(1000);
			for(const film of films) {
				expect(film).to.have.property('release_year', 2006);
			}
		});
	});

	describe('#delete', () => {
		it('should delete a record', async () => {
			await restql.delete('film_actor', {film_id: 1, actor_id: 1});
			const film_actor = await restql.get('film_actor', {film_id: 1, actor_id: 1});
			expect(film_actor).to.have.lengthOf(0);
		});
	});

	describe('#post', () => {
		it('should create a record', async () => {
			await restql.post('film', [{title: 'My Film', language_id: 1}]);
			const films_added = await restql.get('film', {title: 'My Film'});
			expect(films_added).to.have.lengthOf(1);
			expect(films_added[0]).to.have.property('title', 'My Film');
		});

		it('should create multiple records', async () => {
			await restql.post('film', [
				{title: 'My Film 1', language_id: 1},
				{title: 'My Film 2', language_id: 1}
			]);
			const films_added_1 = await restql.get('film', {title: 'My Film 1'});
			expect(films_added_1).to.have.lengthOf(1);
			expect(films_added_1[0]).to.have.property('title', 'My Film 1');

			const films_added_2 = await restql.get('film', {title: 'My Film 2'});
			expect(films_added_2).to.have.lengthOf(1);
			expect(films_added_2[0]).to.have.property('title', 'My Film 2');
		});
	});
});