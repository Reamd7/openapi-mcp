## ADDED Requirements

### Requirement: Document Parsing and Validation
The parser SHALL parse OpenAPI documents and validate them against the OpenAPI specification.

#### Scenario: Parse valid OpenAPI 3.1 document
- **WHEN** a valid OpenAPI 3.1 document is provided
- **THEN** the document SHALL be validated
- **AND** all paths, components, and references SHALL be resolved
- **AND** a parsed document structure SHALL be returned

#### Scenario: Parse valid OpenAPI 3.0 document
- **WHEN** a valid OpenAPI 3.0 document is provided
- **THEN** the document SHALL be validated
- **AND** all paths, components, and references SHALL be resolved
- **AND** a parsed document structure SHALL be returned

#### Scenario: Parse valid OpenAPI 2.0 (Swagger) document
- **WHEN** a valid OpenAPI 2.0 document is provided
- **THEN** the document SHALL be validated
- **AND** all paths and definitions SHALL be resolved
- **AND** a parsed document structure SHALL be returned

#### Scenario: Invalid document format
- **WHEN** an invalid OpenAPI document is provided
- **THEN** a validation error SHALL be thrown
- **AND** the error SHALL indicate the validation failures

### Requirement: Endpoint Indexing
The parser SHALL build an index of all API endpoints for efficient querying.

#### Scenario: Build endpoint index
- **WHEN** a document is parsed
- **THEN** an index of all endpoints SHALL be created
- **AND** each index entry SHALL include: path, method, summary, description, tags, parameters

#### Scenario: Index paths with multiple methods
- **WHEN** a path has multiple HTTP methods (GET, POST, PUT, DELETE)
- **THEN** each method SHALL be indexed separately

#### Scenario: Index path parameters
- **WHEN** a path contains parameters (e.g., /pets/{id})
- **THEN** the parameters SHALL be extracted and indexed
- **AND** the parameter names and types SHALL be included

### Requirement: Schema Indexing
The parser SHALL build an index of all schema definitions for efficient querying.

#### Scenario: Build schema index from OpenAPI 3.x
- **WHEN** an OpenAPI 3.x document is parsed
- **THEN** all schemas from components/schemas SHALL be indexed
- **AND** each schema SHALL include its name and definition

#### Scenario: Build schema index from OpenAPI 2.0
- **WHEN** an OpenAPI 2.0 document is parsed
- **THEN** all definitions SHALL be indexed as schemas
- **AND** each schema SHALL include its name and definition

#### Scenario: Resolve schema references
- **WHEN** a schema contains $ref references
- **THEN** the references SHALL be resolved during indexing
- **AND** the referenced schema SHALL be available in the index

### Requirement: API Information Query
The parser SHALL provide basic API metadata.

#### Scenario: Get API info
- **WHEN** getApiInfo() is called
- **THEN** the API title, version, and description SHALL be returned
- **AND** the OpenAPI version SHALL be included

#### Scenario: Handle missing optional fields
- **WHEN** optional metadata fields are missing
- **THEN** the available fields SHALL be returned
- **AND** missing fields SHALL be omitted or set to null

### Requirement: Endpoint Listing
The parser SHALL support listing endpoints with filtering and pagination.

#### Scenario: List all endpoints
- **WHEN** listEndpoints() is called without filters
- **THEN** all indexed endpoints SHALL be returned
- **AND** results SHALL include path, method, summary, and tags

#### Scenario: Filter by HTTP method
- **WHEN** listEndpoints() is called with method filter (e.g., "GET")
- **THEN** only endpoints with that method SHALL be returned

#### Scenario: Filter by tag
- **WHEN** listEndpoints() is called with tag filter
- **THEN** only endpoints with that tag SHALL be returned

#### Scenario: Paginate results
- **WHEN** listEndpoints() is called with limit and offset
- **THEN** results SHALL be paginated accordingly
- **AND** total count SHALL be included

### Requirement: Endpoint Search
The parser SHALL support full-text search across endpoints.

#### Scenario: Search in all fields
- **WHEN** searchEndpoints() is called with searchIn="all"
- **THEN** search SHALL be performed across path, summary, description, and tags
- **AND** results SHALL be ranked by relevance

#### Scenario: Search in specific field
- **WHEN** searchEndpoints() is called with searchIn="summary"
- **THEN** search SHALL be performed only in the summary field

#### Scenario: No search results
- **WHEN** searchEndpoints() finds no matches
- **THEN** an empty results array SHALL be returned
- **AND** total SHALL be 0

### Requirement: Endpoint Details
The parser SHALL provide detailed information for a specific endpoint.

#### Scenario: Get existing endpoint details
- **WHEN** getEndpointDetails() is called with valid path and method
- **THEN** complete endpoint information SHALL be returned
- **AND** information SHALL include parameters, request body, responses, security

#### Scenario: Get non-existent endpoint
- **WHEN** getEndpointDetails() is called with non-existent path or method
- **THEN** null SHALL be returned

### Requirement: Schema Listing
The parser SHALL support listing schemas with pagination.

#### Scenario: List all schemas
- **WHEN** listSchemas() is called
- **THEN** all indexed schemas SHALL be returned
- **AND** each entry SHALL include schema name

#### Scenario: Paginate schema list
- **WHEN** listSchemas() is called with limit and offset
- **THEN** results SHALL be paginated accordingly
- **AND** total count SHALL be included

### Requirement: Schema Details
The parser SHALL provide detailed information for a specific schema.

#### Scenario: Get existing schema details
- **WHEN** getSchemaDetails() is called with valid schema name
- **THEN** complete schema definition SHALL be returned
- **AND** the definition SHALL include all properties and types
- **AND** dependent schemas SHALL be resolved

#### Scenario: Get non-existent schema
- **WHEN** getSchemaDetails() is called with non-existent schema name
- **THEN** null SHALL be returned
