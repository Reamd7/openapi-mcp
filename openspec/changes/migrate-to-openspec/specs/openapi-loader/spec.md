## ADDED Requirements

### Requirement: Local File Loading
The loader SHALL support loading OpenAPI documents from the local file system.

#### Scenario: Load local JSON file
- **WHEN** a local file path with .json extension is provided
- **THEN** the file SHALL be read from the file system
- **AND** the JSON content SHALL be parsed
- **AND** the parsed document SHALL be returned

#### Scenario: Load local YAML file
- **WHEN** a local file path with .yaml or .yml extension is provided
- **THEN** the file SHALL be read from the file system
- **AND** the YAML content SHALL be parsed
- **AND** the parsed document SHALL be returned

#### Scenario: File not found error
- **WHEN** a local file path that does not exist is provided
- **THEN** a "file not found" error SHALL be thrown
- **AND** the error SHALL include the file path

### Requirement: HTTP URL Loading
The loader SHALL support loading OpenAPI documents from HTTP/HTTPS URLs.

#### Scenario: Load from HTTP URL
- **WHEN** an HTTP URL is provided
- **THEN** an HTTP GET request SHALL be sent
- **AND** the response content SHALL be parsed based on Content-Type or file extension
- **AND** the parsed document SHALL be returned

#### Scenario: Load from HTTPS URL
- **WHEN** an HTTPS URL is provided
- **THEN** an HTTPS GET request SHALL be sent
- **AND** the response content SHALL be parsed based on Content-Type or file extension
- **AND** the parsed document SHALL be returned

#### Scenario: HTTP request failure
- **WHEN** the HTTP request fails (4xx, 5xx, or network error)
- **THEN** an appropriate error SHALL be thrown
- **AND** the error SHALL include the HTTP status code or error message

#### Scenario: HTTP request timeout
- **WHEN** the HTTP request exceeds the timeout duration
- **THEN** a timeout error SHALL be thrown
- **AND** the error SHALL indicate the timeout occurred

### Requirement: Format Detection
The loader SHALL automatically detect the document format (JSON or YAML).

#### Scenario: Auto-detect JSON by extension
- **WHEN** a source has .json extension
- **THEN** the content SHALL be parsed as JSON

#### Scenario: Auto-detect YAML by extension
- **WHEN** a source has .yaml or .yml extension
- **THEN** the content SHALL be parsed as YAML

#### Scenario: Auto-detect YAML for HTTP response
- **WHEN** HTTP response has Content-Type: application/x-yaml or text/yaml
- **THEN** the content SHALL be parsed as YAML

### Requirement: Error Handling
The loader SHALL provide clear error messages for all failure scenarios.

#### Scenario: Invalid JSON format
- **WHEN** a JSON file contains invalid syntax
- **THEN** a "JSON parse error" SHALL be thrown
- **AND** the error SHALL include details about the parse failure

#### Scenario: Invalid YAML format
- **WHEN** a YAML file contains invalid syntax
- **THEN** a "YAML parse error" SHALL be thrown
- **AND** the error SHALL include details about the parse failure
