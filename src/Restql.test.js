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

	describe('#get', () => {
		it('should create SELECT query with no condition', async () => {
			when(mockSession.query(anything())).thenCallback(null, [], {});
			await restql.get('employees', {});
			verify(mockSession.query('SELECT * FROM `employees`;', anything()));
		});

		it('should create SELECT query with one condition', async () => {
			when(mockSession.query(anything())).thenCallback(null, [], {});
			await restql.get('employees', {employee_id: 1});
			verify(mockSession.query('SELECT * FROM `employees` WHERE `employee_id`=1;', anything()));
		});

		it('should create SELECT query with multiple conditions', async () => {
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
		it('should create DELECT query', async () => {
			when(mockSession.query(anything())).thenCallback(null, [], {});
			await restql.delete('employees', {age: 21});
			verify(mockSession.query('DELETE FROM `employees` WHERE `age`=21;', anything()));
		});
	});

	describe('#post', () => {
		it('should create INSERT query with one row', async () => {
			when(mockSession.query(anything())).thenCallback(null, [], {});
			await restql.post('employees', [{name: 'Charles', age: 23}]);
			verify(mockSession.query('INSERT INTO `employees`(`name`,`age`) VALUES (\'Charles\',23);', anything()));
		});

		it('should create INSERT query with multiple rows', async () => {
			when(mockSession.query(anything())).thenCallback(null, [], {});
			await restql.post('employees', 
				[{name: 'Charles', age: 23}, {name: 'David', age: 24}]);
			verify(mockSession.query('INSERT INTO `employees`(`name`,`age`) VALUES (\'Charles\',23),(\'David\',24);', anything()));
		});
	});

	describe('#put', () => {
		it('should create UPDATE query', async () => {
			when(mockSession.query(anything())).thenCallback(null, [], {});
			await restql.put('employees', {age: 24}, {name: 'Charles'});
			verify(mockSession.query('UPDATE `employees` SET `age`=24 WHERE `name`=\'Charles\';', anything()));
		});
	});
});