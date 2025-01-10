// Servis za chistenje na tmp direktoriumot
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const debug = require('../utils/debug');
const chalk = require('chalk');

// Defaultni vrednosti za starosta na fajlovite
const __max_age = {
	days: parseInt(process.env.MAX_AGE_DAYS || '2'),  // Zemi od .env ili koristi 2 kako default
	minutes: 0                                        // Za racno chistenje (0 = site fajlovi)
};

// Chistenje na fajlovi
async function _cleanup_tmp_files(manual = false) {
	try {
		const _tmp_dir = path.resolve(process.env.TEMP_DIR || 'tmp');
		debug.log(chalk.blueBright('Starting cleanup of tmp directory:', _tmp_dir));

		// Zemi gi site fajlovi od tmp direktoriumot
		const _files = await fs.readdir(_tmp_dir);
		debug.log(chalk.blueBright('Found files:', _files));

		const _now = Date.now();
		let _deleted_count = 0;

		// Izminuvaj gi site fajlovi
		for (const file of _files) {
			// Preskokni go .gitkeep
			if (file === '.gitkeep') {
				debug.log(chalk.blueBright('Skipping .gitkeep file'));
				continue;
			}

			const _file_path = path.join(_tmp_dir, file);
			const _stats = await fs.stat(_file_path);

			// Presmeti starost vo denovi i minuti
			const _age_in_days = (_now - _stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
			const _age_in_minutes = (_now - _stats.mtime.getTime()) / (1000 * 60);

			let _should_delete = false;

			if (manual) {
				// Ako e racno chistenje, izbrishi gi site osven .gitkeep
				_should_delete = true;
				debug.log(chalk.blueBright(`Manual cleanup - will delete: ${file}`));
			} else {
				// Ako e avtomatsko, proveri starost
				_should_delete = _age_in_days > __max_age.days;
				debug.log(chalk.blueBright(`Auto cleanup - file ${file} is ${_age_in_days.toFixed(1)} days old`));
			}

			if (_should_delete) {
				debug.log(chalk.yellow(`Attempting to delete file: ${file}`));
				try {
					await fs.unlink(_file_path);
					debug.log(chalk.green(`Successfully deleted: ${file}`));
					_deleted_count++;
				} catch (err) {
					debug.log(chalk.red(`Error deleting file ${file}:`, err.message));
				}
			}
		}

		logger.info('Tmp directory cleanup completed', {
			deletedFiles: _deleted_count,
			checkedFiles: _files.length,
			directory: _tmp_dir,
			type: manual ? 'manual' : 'automatic'
		});

		debug.log(chalk.green(`Cleanup completed. Deleted ${_deleted_count} files`));
		return {
			deletedCount: _deleted_count,
			totalFiles: _files.length
		};
	} catch (error) {
		logger.error('Error during tmp cleanup:', error);
		debug.log(chalk.red('Cleanup failed:', error.message));
		throw error;
	}
}

// Startuvanje na dnevno chistenje
function _start_daily_cleanup() {
	debug.log(chalk.blueBright('Setting up daily cleanup schedule'));
	debug.log(chalk.blueBright(`Files older than ${__max_age.days} days will be cleaned up`));

	// Napravi cleanup vednas na startup
	_cleanup_tmp_files(false);

	// Postavi dnevno chistenje vo 00:00
	setInterval(() => {
		const _now = new Date();
		if (_now.getHours() === 0 && _now.getMinutes() === 0) {
			_cleanup_tmp_files(false);
		}
	}, 60000); // Proverka sekoja minuta
}

module.exports = {
	cleanupTmpFiles: _cleanup_tmp_files,
	startDailyCleanup: _start_daily_cleanup
};
