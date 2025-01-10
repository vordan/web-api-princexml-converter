// Utils
const debug = require('./debug');
const chalk = require('chalk');

// Konvertira string vo slug format
function _string_to_slug(str) {
	if (!str) return '';

	debug.log(chalk.blueBright('Converting to slug:', str));

	return str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')    // Remove special chars
		.replace(/[\s_-]+/g, '-')     // Replace spaces and underscores with single dash
		.replace(/^-+|-+$/g, '');     // Remove starting/ending dashes
}

// Kreira timestamp vo format YYYY-MM-DD-HHMM
function _get_timestamp() {
	const _now = new Date();
	const _year = _now.getFullYear();
	const _month = String(_now.getMonth() + 1).padStart(2, '0');
	const _day = String(_now.getDate()).padStart(2, '0');
	const _hours = String(_now.getHours()).padStart(2, '0');
	const _minutes = String(_now.getMinutes()).padStart(2, '0');

	return `${_year}-${_month}-${_day}-${_hours}${_minutes}`;
}

module.exports = {
	stringToSlug: _string_to_slug,
	getTimestamp: _get_timestamp
};
