## ADDED Requirements

### Requirement: Get API Info Tool
The MCP tools SHALL include a tool to retrieve basic API information.

#### Scenario: Successful API info retrieval
- **WHEN** get_api_info tool is called with spec_path
- **THEN** the API title, version, and description SHALL be returned
- **AND** the OpenAPI version SHALL be included

#### Scenario: Invalid spec path
- **WHEN** get_api_info is called with non-existent spec_path
- **THEN** an appropriate error SHALL be returned

### Requirement: List Endpoints Tool
The MCP tools SHALL include a tool to list API endpoints with filtering.

#### Scenario: List all endpoints
- **WHEN** list_endpoints tool is called with spec_path
- **THEN** all endpoints SHALL be returned
- **AND** each endpoint SHALL include path, method, summary, tags

#### Scenario: Filter by HTTP method
- **WHEN** list_endpoints is called with method="GET"
- **THEN** only GET endpoints SHALL be returned

#### Scenario: Filter by tag
- **WHEN** list_endpoints is called with tag="pets"
- **THEN** only endpoints with the "pets" tag SHALL be returned

#### Scenario: Paginate results
- **WHEN** list_endpoints is called with limit=10, offset=0
- **THEN** the first 10 endpoints SHALL be returned
- **AND** total count SHALL be included

### Requirement: Search Endpoints Tool
The MCP tools SHALL include a tool to search endpoints by keyword.

#### Scenario: Search with query
- **WHEN** search_endpoints is called with query="pet"
- **THEN** endpoints matching "pet" SHALL be returned
- **AND** results SHALL be ranked by relevance

#### Scenario: Search in specific field
- **WHEN** search_endpoints is called with query="list" and searchIn="summary"
- **THEN** only summaries SHALL be searched
- **AND** matching endpoints SHALL be returned

#### Scenario: No search results
- **WHEN** search_endpoints finds no matches
- **THEN** empty results array SHALL be returned
- **AND** total SHALL be 0

#### Scenario: Invalid searchIn parameter
- **WHEN** search_endpoints is called with invalid searchIn value
- **THEN** an appropriate error SHALL be returned

### Requirement: Get Endpoint Details Tool
The MCP tools SHALL include a tool to retrieve detailed endpoint information.

#### Scenario: Get existing endpoint details
- **WHEN** get_endpoint_details is called with path="/pets", method="GET"
- **THEN** complete endpoint information SHALL be returned
- **AND** information SHALL include: parameters, responses, security

#### Scenario: Get non-existent endpoint
- **WHEN** get_endpoint_details is called with non-existent path
- **THEN** null SHALL be returned
- **OR** an appropriate error message SHALL be returned

#### Scenario: Missing required parameter
- **WHEN** get_endpoint_details is called without path
- **THEN** a validation error SHALL be returned

### Requirement: List Schemas Tool
The MCP tools SHALL include a tool to list data schemas.

#### Scenario: List all schemas
- **WHEN** list_schemas tool is called with spec_path
- **THEN** all schema names SHALL be returned
- **AND** each name SHALL be a string

#### Scenario: Paginate schema list
- **WHEN** list_schemas is called with limit=20
- **THEN** the first 20 schemas SHALL be returned
- **AND** total count SHALL be included

#### Scenario: Document with no schemas
- **WHEN** list_schemas is called on a document with no schemas
- **THEN** empty results array SHALL be returned

### Requirement: Get Schema Details Tool
The MCP tools SHALL include a tool to retrieve detailed schema information.

#### Scenario: Get existing schema details
- **WHEN** get_schema_details is called with name="Pet"
- **THEN** complete schema definition SHALL be returned
- **AND** properties and types SHALL be included
- **AND** required fields SHALL be marked

#### Scenario: Get non-existent schema
- **WHEN** get_schema_details is called with non-existent name
- **THEN** null SHALL be returned
- **OR** an appropriate error message SHALL be returned

#### Scenario: Schema with nested references
- **WHEN** get_schema_details is called on a schema with $ref
- **THEN** referenced schemas SHALL be resolved
- **AND** dependencies SHALL be included in the response

### Requirement: Tool Input Validation
All MCP tools SHALL validate their input parameters.

#### Scenario: Missing spec_path
- **WHEN** any tool is called without spec_path
- **THEN** a validation error SHALL be returned
- **AND** the error SHALL indicate the missing parameter

#### Scenario: Invalid parameter type
- **WHEN** a tool is called with wrong parameter type
- **THEN** a validation error SHALL be returned
- **AND** the error SHALL indicate the type mismatch

### Requirement: Tool Response Formatting
All MCP tools SHALL return responses in a consistent format.

#### Scenario: Successful tool response
- **WHEN** a tool executes successfully
- **THEN** the response SHALL be JSON-formatted
- **AND** the response SHALL include a "content" array with text results

#### Scenario: Error response
- **WHEN** a tool encounters an error
- **THEN** the response SHALL include error details
- **AND** the error message SHALL be descriptive
