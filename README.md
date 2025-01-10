# PrinceXML Converter to PDF Service

Microservice with RESTful API to convert HTML documents to PDF using PrinceXML.

## Prerequisites

- Node.js (v14 or higher)
- PrinceXML installed on your system (https://www.princexml.com/)
- npm

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd web-api-princexml-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables by copying the example file:
   ```bash
   cp .env.example .env
   ```

4. Create necessary directories:
   ```bash
   mkdir logs tmp
   ```

## Configuration

### Environment Variables (.env)

```plaintext
PORT=7171              # Server port
DEBUG=true             # Enable debug logging
LOG_DIR=logs          # Log directory
TEMP_DIR=tmp          # Temporary files directory
PRINCE_PATH=/usr/local/bin/prince  # Path to PrinceXML executable
```

### Configuration File (config/config.json)

```json
{
    "prince": {
        "options": {
            "javascript": true,
            "media": "screen",
            "insecure": false
        },
        "timeout": 30000
    },
    "upload": {
        "maxFileSize": "10mb",
        "allowedFileTypes": [".html", ".css"]
    }
}
```

## API Endpoints

### Convert HTML to PDF

**POST /convert**

Converts HTML to PDF using PrinceXML.

Request body:
```json
{
    "htmlFile": "/absolute/path/to/file.html",
    // OR
    "htmlContent": "<html>...</html>",
    "cssFiles": [
        "/path/to/style1.css",
        "/path/to/style2.css"
    ]
}
```

Parameters:
- `htmlFile`: (Optional) Absolute path to HTML file
- `htmlContent`: (Optional) HTML content as string
- `cssFiles`: (Optional) Array of paths to CSS files

Note: Either `htmlFile` or `htmlContent` must be provided.

Response:
- Success: PDF file (application/pdf)
- Error: JSON error message

Example success response:
- Content-Type: application/pdf
- Content-Disposition: attachment; filename=output.pdf

Example error response:
```json
{
    "error": "Input file not found"
}
```

### Get Help

**GET /help**

Returns this documentation in markdown format.

## Error Handling

The service provides detailed error messages for common scenarios:
- 400 Bad Request: Missing or invalid input parameters
- 404 Not Found: Input file not found
- 500 Internal Server Error: Conversion or system errors

## Logging

The service maintains two types of logs:
- Conversion logs: All conversion attempts (success/failure)
- Error logs: Detailed error information

Logs are automatically rotated weekly and stored in the `logs` directory.

## Development

Start the service in development mode with auto-reload:
```bash
npm run dev
```

Start in production mode:
```bash
npm start
```

## Testing Examples

Using curl:

```bash
# Convert HTML file
curl -X POST http://localhost:7171/convert \
  -H "Content-Type: application/json" \
  -d '{
    "htmlFile": "/path/to/input.html",
    "cssFiles": ["/path/to/style.css"]
  }'

# Convert HTML content
curl -X POST http://localhost:7171/convert \
  -H "Content-Type: application/json" \
  -d '{
    "htmlContent": "<html><body><h1>Test</h1></body></html>"
  }'

# Get help
curl http://localhost:7171/help
```

Using Node.js:

```javascript
const axios = require('axios');
const fs = require('fs');

async function convertToPdf() {
    try {
        const response = await axios.post('http://localhost:7171/convert', {
            htmlContent: '<html><body><h1>Test</h1></body></html>'
        }, {
            responseType: 'arraybuffer'
        });

        fs.writeFileSync('output.pdf', response.data);
        console.log('PDF created successfully');
    } catch (error) {
        console.error('Conversion failed:', error.message);
    }
}
```

## License

This project is licensed under the MIT License.

## Author

Vanco Ordanoski

## Version

1.0.1
