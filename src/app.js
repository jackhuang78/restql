const express = require('express');
const Restql = require('./restql');

// Create an Express app
const app = express();
const restql = new Restql();

app.get('/', (req, res) => {
	res.send('Hello World!');
});

// Start the app as a server
app.listen(3000, () => {
	console.log('Example app listening on port 3000!');
});