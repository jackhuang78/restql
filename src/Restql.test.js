const td = require('testdouble');
const chai = require('chai');
const chai_also = require('chai-also');
const exec = require('promised-exec');
const {object:mock, when, verify, replace, reset, matchers:{anything}} = require('testdouble');

chai.use(chai_also);
const expect = chai.expect;

describe('#Restql', () => {
	let restql;
	let mockSession;

	beforeEach(() => {
		mockSession = mock(['connect', 'end', 'query']);
		when(mockSession.connect()).thenCallback(null);
		when(mockSession.end()).thenCallback(null);
		
		when(replace(require('mysql'), 'createConnection')(anything()))
			.thenReturn(mockSession);
		replace('mysql', require('mysql'));

		const Restql = require('./Restql');
		restql = new Restql('localhost', 'root', '', 'sakila');
	}); 

	afterEach(() => {
		reset();
	});

	describe.only('#get', () => {
		it('should create query with no condition', async () => {
			when(mockSession.query(anything())).thenCallback(null, [], {});
			await restql.get('employees', {});
			verify(mockSession.query('SELECT * FROM `employees`;', anything()));
		});

		it('should create query with one condition', async () => {
			when(mockSession.query(anything())).thenCallback(null, [], {});
			await restql.get('employees', {employee_id: 1});
			verify(mockSession.query('SELECT * FROM `employees` WHERE `employee_id`=1;', anything()));
		});

		it('should create query with multiple conditions', async () => {
			when(mockSession.query(anything())).thenCallback(null, [], {});
			await restql.get('employees', {employee_id: 1, age: 21});
			verify(mockSession.query('SELECT * FROM `employees` WHERE `employee_id`=1 AND `age`=21;', anything()));
		});

		it('should handle no row', async () => {
			when(mockSession.query(anything())).thenCallback(null, [], {});
			const employees = await restql.get('employees', {});
			expect(employees).to.have.lengthOf(0);
		});

		it('should handle multiple rows', async () => {
			when(mockSession.query(anything())).thenCallback(null, 
				[{employee_id: 1, name: 'Adam'}, {employee_id: 2, name: 'Bob'}], {});
			const employees = await restql.get('employees', {});
			expect(employees).to.have.lengthOf(2);
			expect(employees[0])
				.to.have.property('employee_id', 1)
				.and.also.property('name', 'Adam');
			expect(employees[1])
				.to.have.property('employee_id', 2)
				.and.also.property('name', 'Bob');

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

	describe('#put', () => {
		it('should update a record', async () => {
			await restql.put('film', {title: 'My Film'}, {film_id: 1});
			const film_updated = await restql.get('film', {film_id: 1});
			expect(film_updated).to.have.lengthOf(1);
			expect(film_updated[0]).to.have.property('title', 'My Film');
		});
	});
});