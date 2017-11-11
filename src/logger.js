const winston = require('winston');

// Create logger
const logger = winston.createLogger({
	level: 'info',	// TODO: add colors
	format: winston.format.json(),
	transports: [
		new winston.transports.File({ 
			filename: 'log/app.log', 
		})
	],
});
if (process.env.NODE_ENV !== 'production') {
	logger.add(new winston.transports.Console({
		format: winston.format.simple()
	}));
}

module.exports = logger;