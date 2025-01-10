// Util za debugging poraki
const chalk = require('chalk');

// Globalna debug promenliva
const __debug_enabled = process.env.DEBUG === 'true';

// Ispechati debug poraka
function _print_debug(...args) {
	if (__debug_enabled) {
		console.log(chalk.yellow('[DEBUG]'), ...args);
	}
}

module.exports = {
	log: _print_debug
};
