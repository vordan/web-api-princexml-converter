// Kontroler za konverzija
const princeService = require('../services/princeService');
const logger = require('../utils/logger');
const debug = require('../utils/debug');
const fs = require('fs').promises;
const chalk = require('chalk');
const path = require('path');

// Konvertiranje na HTML vo PDF
async function _convert(req, res) {
	const { htmlFile, htmlContent, cssFiles = [], filename } = req.body;

	try {
		let _input;

		if (htmlContent) {
			// Ako imame HTML content, zachuvaj go vo temp file
			_input = await princeService.saveHtmlContent(htmlContent);
			debug.log('Created temporary HTML file:', _input);
		} else {
			// Inaku koristi go dadeniot file
			_input = htmlFile;
			// Proveri dali postoi
			await fs.access(htmlFile);
		}

		const _output_info = await princeService.convertToPdf(_input, cssFiles, filename);

		if (htmlContent) {
			// Izbrishi go temp file ako sme go kreirale
			await fs.unlink(_input).catch(err => {
				debug.log(chalk.yellow('Warning: Could not delete temp input file:', err.message));
			});
		}

		// Construct full URL using SERVER_URL from env
		const _base_url = process.env.SERVER_URL || 'http://localhost';
		const _base_path = process.env.BASE_PATH || '';
		const _file_url = `${_base_url}${_base_path}/tmp/${path.basename(_output_info.filePath)}`;

		// Return JSON response with file info
		res.status(200).json({
			fileUrl: _file_url,
			filePath: _output_info.filePath
		});

		logger.info('Conversion completed successfully', {
			input: _input,
			output: _output_info.filePath
		});
	} catch (error) {
		logger.error('Conversion failed:', error);
		debug.log(chalk.red('Error during conversion:', error.message));

		if (error.code === 'ENOENT') {
			res.status(404).json({ error: 'Input file not found' });
		} else {
			res.status(500).json({ error: 'Conversion failed: ' + error.message });
		}
	}
}

module.exports = {
	convert: _convert
};
