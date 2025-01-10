// Middleware za validacija na baranja
const logger = require('../utils/logger');
const debug = require('../utils/debug');

// Validacija na convert baranje
function _validate_convert_request(req, res, next) {
	const { htmlFile, htmlContent } = req.body;

	if (!htmlFile && !htmlContent) {
		const error = new Error('Either htmlFile or htmlContent must be provided');
		logger.error('Validation failed:', error.message);
		debug.log(chalk.red('Validation Error:', error.message));
		return res.status(400).json({ error: error.message });
	}

	next();
}

module.exports = {
	validateConvertRequest: _validate_convert_request
};
