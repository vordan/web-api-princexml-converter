// Glavna aplikacija za PrinceXML konverter
const express = require('express');
const dotenv = require('dotenv');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');

// Konfiguracija na .env
dotenv.config();

// Lokalni moduli
const logger = require('./utils/logger');
const debug = require('./utils/debug');
const convertController = require('./controllers/convertController');
const validation = require('./middleware/validation');
const cleanupService = require('./services/cleanupService');

const app = express();
const port = process.env.PORT || 7171;

// Middleware za parsiranje na JSON
app.use(express.json());

// Serve static files from tmp directory
app.use('/tmp', express.static(process.env.TEMP_DIR || 'tmp'));

// GET endpoint za pomosh
function _help_endpoint(req, res) {
    const readme = path.join(__dirname, '../README.md');
    debug.log(`Looking for README at: ${readme}`);

    try {
        const content = fs.readFileSync(readme, 'utf8');
        debug.log(chalk.green(`README found, size: ${content.length} bytes`));

        if (!content || content.length === 0) {
            debug.log(chalk.red('README is empty'));
            return res.status(500).json({ error: 'Documentation is empty' });
        }

        // Check if HTML format is requested
        const format = req.query.format || 'md';

        if (format === 'html') {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>API Documentation</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
                        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; }
                        code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
                    </style>
                </head>
                <body>
                    ${marked(content)}
                </body>
                </html>
            `;
            res.setHeader('Content-Type', 'text/html');
            res.send(htmlContent);
        } else {
            res.setHeader('Content-Type', 'text/markdown');
            res.send(content);
        }
    } catch (error) {
        debug.log(chalk.red('Error reading README:', error));
        res.status(500).json({ error: 'Error loading documentation' });
    }
}

// Test endpoint
app.get('/test', (req, res) => {
	debug.log('Test endpoint called');
	res.json({ status: 'ok', message: 'Server is running' });
});

// Rutiranje
app.get('/help', _help_endpoint);
app.post('/convert', validation.validateConvertRequest, convertController.convert);
app.post('/cleanup', async (req, res) => {
	try {
		const result = await cleanupService.cleanupTmpFiles(true);  // Manual cleanup
		res.json({
			message: 'Cleanup completed',
			deletedFiles: result.deletedCount,
			totalFiles: result.totalFiles
		});
	} catch (error) {
		debug.log(chalk.red('Cleanup error:', error));
		res.status(500).json({ error: 'Cleanup failed: ' + error.message });
	}
});

// Startuvanje na serverot
function _start_server() {
	app.listen(port, '0.0.0.0', () => {
		logger.info(`Server started on port ${port}`);
		debug.log(`Server running at ${chalk.green(`${process.env.SERVER_URL}:${port}`)}`);

		// Startuvaj dnevno chistenje na tmp folderot
		cleanupService.startDailyCleanup();

		// Print active routes
		const _routes = app._router.stack
			.filter(r => r.route && r.route.path)
			.map(r => `${r.route.stack[0].method.toUpperCase()} ${r.route.path}`)
			.join(' | ');

		debug.log('Active routes:', _routes);
	});
}

_start_server();

// Error handling middleware
app.use(function _error_handler(err, req, res, next) {
	logger.error('Application error:', err.stack);
	debug.log(chalk.red('Error:', err.message));
	res.status(500).json({ error: 'Internal server error' });
});
