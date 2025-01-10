// Util za logiranje so Winston
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Formater za logovi
const _log_format = winston.format.combine(
	winston.format.timestamp(),
	winston.format.json()
);

// Rotiraчki transport za konverzii
const _conversion_transport = new DailyRotateFile({
	filename: path.join(process.env.LOG_DIR, 'conversions-%DATE%.log'),
	datePattern: 'YYYY-MM-DD',
	maxFiles: '14d'
});

// Rotiraчki transport za greski
const _error_transport = new DailyRotateFile({
	filename: path.join(process.env.LOG_DIR, 'errors-%DATE%.log'),
	datePattern: 'YYYY-MM-DD',
	maxFiles: '14d',
	level: 'error'
});

// Kreiranje na logger
const logger = winston.createLogger({
	format: _log_format,
	transports: [
		_conversion_transport,
		_error_transport
	]
});

module.exports = logger;
