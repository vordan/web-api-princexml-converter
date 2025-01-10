// Servis za PrinceXML konverzija
const prince = require('prince');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const debug = require('../utils/debug');
const chalk = require('chalk');
const utils = require('../utils/utils');

// Konvertiranje na HTML vo PDF
async function _convert_to_pdf(input, cssFiles = [], filename = '') {
	// Ensure tmp directory exists
	const _tmp_dir = path.resolve(process.env.TEMP_DIR || 'tmp');
	await fs.mkdir(_tmp_dir, { recursive: true });

	// Create output filename
	const _timestamp = Date.now();
	const _random = Math.random().toString(36).substring(7);
	const _base_name = filename ?
		utils.stringToSlug(filename) :
		`output-${_timestamp}-${_random}`;
	const _output_file = path.join(_tmp_dir, `${_base_name}.pdf`);

	try {
		debug.log(chalk.blueBright('Starting PDF conversion'));
		debug.log(chalk.blueBright('Input:', input));
		debug.log(chalk.blueBright('Output:', _output_file));

		// Create Prince instance
		const princeInstance = new prince();

		// Add CSS files if provided
		if (cssFiles && cssFiles.length > 0) {
			debug.log(chalk.blueBright('Adding CSS files:', cssFiles));
			princeInstance.styleSheets(cssFiles);
		}

		// Execute conversion
		await princeInstance
			.inputs(input)
			.output(_output_file)
			.execute();

		debug.log(chalk.green('PDF created successfully'));

		// Verify the file exists and is readable
		await fs.access(_output_file, fs.constants.R_OK);

		logger.info('PDF conversion successful', {
			input,
			output: _output_file
		});

		return {
			filePath: _output_file
		};
	} catch (error) {
		logger.error('PDF conversion failed:', error);
		debug.log(chalk.red('Conversion failed:', error.message));
		// Clean up if file exists
		await fs.unlink(_output_file).catch(() => {});
		throw error;
	}
}

// Zachuvuvanje na HTML content vo temp file
async function _save_html_content(content) {
	const _tmp_dir = path.resolve(process.env.TEMP_DIR || 'tmp');
	await fs.mkdir(_tmp_dir, { recursive: true });

	const _timestamp = Date.now();
	const _random = Math.random().toString(36).substring(7);
	const _temp_file = path.join(_tmp_dir, `input-${_timestamp}-${_random}.html`);

	await fs.writeFile(_temp_file, content);
	debug.log(chalk.blueBright('Saved HTML content to:', _temp_file));
	return _temp_file;
}

module.exports = {
	convertToPdf: _convert_to_pdf,
	saveHtmlContent: _save_html_content
};
