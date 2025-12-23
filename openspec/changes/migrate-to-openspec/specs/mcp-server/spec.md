## ADDED Requirements

### Requirement: MCP Server Initialization
The MCP server SHALL initialize with an OpenAPI document source and load all available tools.

#### Scenario: Successful initialization with local file
- **WHEN** server is started with a valid local OpenAPI file path
- **THEN** the document SHALL be loaded successfully
- **AND** all 6 query tools SHALL be registered
- **AND** the server SHALL be ready to accept MCP requests

#### Scenario: Successful initialization with HTTP URL
- **WHEN** server is started with a valid HTTP/HTTPS URL
- **THEN** the document SHALL be fetched and loaded
- **AND** all 6 query tools SHALL be registered
- **AND** the server SHALL be ready to accept MCP requests

#### Scenario: Initialization failure with invalid source
- **WHEN** server is started with an invalid source
- **THEN** an appropriate error message SHALL be returned
- **AND** the server SHALL not start

### Requirement: MCP Tool Registry
The server SHALL maintain a registry of all available MCP tools and respond to tool listing requests.

#### Scenario: List all available tools
- **WHEN** a `tools/list` request is received
- **THEN** the server SHALL return all 6 registered tools
- **AND** each tool SHALL include name, description, and input schema

#### Scenario: Tool list includes query tools
- **WHEN** tools are listed
- **THEN** the list SHALL include: get_api_info, list_endpoints, search_endpoints, get_endpoint_details, list_schemas, get_schema_details

### Requirement: MCP Tool Invocation
The server SHALL handle tool invocation requests and route them to the appropriate handler.

#### Scenario: Successful tool call
- **WHEN** a `tools/call` request is received with valid parameters
- **THEN** the server SHALL route to the corresponding tool handler
- **AND** the result SHALL be returned as formatted JSON

#### Scenario: Tool call with invalid parameters
- **WHEN** a `tools/call` request is received with invalid parameters
- **THEN** the server SHALL return an appropriate error response
- **AND** the error message SHALL describe what was invalid

#### Scenario: Tool call for non-existent tool
- **WHEN** a `tools/call` request references a non-existent tool
- **THEN** the server SHALL return a "tool not found" error

### Requirement: MCP Protocol Communication
The server SHALL communicate using the MCP stdio protocol with JSON-RPC messages.

#### Scenario: Handle JSON-RPC request
- **WHEN** a valid JSON-RPC request is received on stdin
- **THEN** the server SHALL parse the request
- **AND** process the requested method
- **AND** return the response on stdout

#### Scenario: Handle malformed JSON-RPC
- **WHEN** a malformed JSON-RPC message is received
- **THEN** the server SHALL return a JSON-RPC error response
- **AND** the error SHALL indicate the parsing failure

### Requirement: Server Lifecycle Management
The server SHALL support proper startup and shutdown procedures.

#### Scenario: Clean server shutdown
- **WHEN** the server receives a shutdown signal
- **THEN** all resources SHALL be released
- **AND** open connections SHALL be closed gracefully

#### Scenario: Server error during operation
- **WHEN** an unexpected error occurs during operation
- **THEN** the error SHALL be logged
- **AND** the server SHALL continue running if possible
- **AND** the client SHALL receive an appropriate error response
