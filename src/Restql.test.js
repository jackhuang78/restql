const expect = require('chai').expect;
const Restql = require('./Restql');

describe('Restql', () => {
	it('should be initialized', () => {
		expect(new Restql()).to.be.not.null;
	});
});