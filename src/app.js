const ArgumentParser = require('argparse').ArgumentParser;
const express = require('express');
const Restql = require('./restql');
const npmPackage = require('../package.json');

// Parse arguments
const parser = new ArgumentParser({
	addHelp: true,
	description: npmPackage.description,
	version: npmPackage.version,
});
parser.addArgument(['-p', '--port'], {
	dest: 'port',
	type: 'int',
	defaultValue: 3000,
});
const args = parser.parseArgs();

console.log(args);


// Create an Express app
const app = express();
const restql = new Restql();

app.get('/', (req, res) => {
	res.send('Hello World!');
});

// Start the app as a server
app.listen(args.port, () => {
	console.log(`Example app listening on port ${args.port}!`);
});