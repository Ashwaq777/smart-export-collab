# Smart Export Global Platform - Backend API

REST API for customs tariff management built with Spring Boot, PostgreSQL, and Maven.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **PostgreSQL**
- **Maven**
- **Spring Data JPA**
- **Flyway** (database migrations)
- **Lombok**

## Database Schema

### Tables

1. **product_categories**
   - `id` (PK)
   - `name` (unique)

2. **countries**
   - `id` (PK)
   - `name`
   - `iso_code` (unique, 2-3 chars)
   - `region` (EU, USA, ASIA, AFRICA)

3. **tariff_rules**
   - `id` (PK)
   - `code_hs` (Harmonized System Code)
   - `category_id` (FK → product_categories)
   - `country_id` (FK → countries)
   - `customs_duty_rate` (percentage)
   - `vat_rate` (percentage)
   - Unique constraint: `(code_hs, country_id)`

## API Endpoints

### Product Categories

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category

### Countries

- `GET /api/countries` - List all countries
- `POST /api/countries` - Create a new country

### Tariff Rules

- `GET /api/tariffs` - List all tariff rules
- `GET /api/tariffs/{id}` - Get tariff by ID
- `POST /api/tariffs` - Create a new tariff rule
- `PUT /api/tariffs/{id}` - Update a tariff rule
- `DELETE /api/tariffs/{id}` - Delete a tariff rule
- `GET /api/tariffs/search?codeHs=XXXX&countryIso=FR` - Search tariff by HS code and country

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+

## Setup Instructions

### 1. Install PostgreSQL

If not already installed:

```bash
# macOS (using Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Or use Docker
docker run --name postgres-smartexport -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE smart_export_db;

# Exit
\q
```

### 3. Configure Database Connection

Edit `src/main/resources/application.yml` if needed (default credentials: postgres/postgres):

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/smart_export_db
    username: postgres
    password: postgres
```

### 4. Build the Project

```bash
cd smart-export-platform
mvn clean install
```

### 5. Run the Application

```bash
mvn spring-boot:run
```

The API will start on `http://localhost:8080`

Flyway will automatically:
- Create the database schema
- Insert sample data (2 categories, 3 countries, 3 tariff rules)

## Sample Data

### Categories
- Agroalimentaire
- Textile

### Countries
- France (FR, EU)
- United States (US, USA)
- Morocco (MA, AFRICA)

### Tariff Rules
- HS 0901.21 → France: 7.5% customs, 20% VAT
- HS 0901.21 → USA: 0% customs, 0% VAT
- HS 6204.42 → Morocco: 2.5% customs, 20% VAT

## Testing the API

### Create a Category

```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Electronics"}'
```

### Create a Country

```bash
curl -X POST http://localhost:8080/api/countries \
  -H "Content-Type: application/json" \
  -d '{"name": "China", "isoCode": "CN", "region": "ASIA"}'
```

### Create a Tariff Rule

```bash
curl -X POST http://localhost:8080/api/tariffs \
  -H "Content-Type: application/json" \
  -d '{
    "codeHs": "8517.12",
    "categoryId": 1,
    "countryId": 1,
    "customsDutyRate": 5.00,
    "vatRate": 20.00
  }'
```

### Search for a Tariff

```bash
curl "http://localhost:8080/api/tariffs/search?codeHs=0901.21&countryIso=FR"
```

### Get All Tariffs

```bash
curl http://localhost:8080/api/tariffs
```

### Update a Tariff

```bash
curl -X PUT http://localhost:8080/api/tariffs/1 \
  -H "Content-Type: application/json" \
  -d '{
    "codeHs": "0901.21",
    "categoryId": 1,
    "countryId": 1,
    "customsDutyRate": 8.00,
    "vatRate": 20.00
  }'
```

### Delete a Tariff

```bash
curl -X DELETE http://localhost:8080/api/tariffs/1
```

## Project Structure

```
smart-export-platform/
├── src/
│   ├── main/
│   │   ├── java/com/smartexport/platform/
│   │   │   ├── controller/          # REST controllers
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── entity/              # JPA entities
│   │   │   ├── repository/          # Spring Data repositories
│   │   │   ├── service/             # Business logic
│   │   │   └── SmartExportPlatformApplication.java
│   │   └── resources/
│   │       ├── application.yml      # Configuration
│   │       └── db/migration/        # Flyway SQL scripts
│   └── test/
├── pom.xml
└── README.md
```

## Validation

All DTOs include validation annotations:
- `@NotBlank` - Required string fields
- `@NotNull` - Required fields
- `@DecimalMin` - Minimum value constraints
- `@Size` - String length constraints

Invalid requests will return HTTP 400 with validation error details.

## Database Migrations

Flyway manages database schema versions. Migration files are in `src/main/resources/db/migration/`:
- `V1__init.sql` - Initial schema and seed data

To add new migrations, create files with naming pattern: `V{version}__{description}.sql`

## Notes

- All ISO codes are stored in uppercase
- Rates are stored as percentages (e.g., 20.00 for 20%)
- The unique constraint on `(code_hs, country_id)` prevents duplicate tariff rules
- EAGER fetching is used for category and country relationships to avoid N+1 queries

## Next Steps (Future Features)

- Currency conversion logic
- PDF export functionality
- Simulation/calculation endpoints
- Authentication & authorization
- Audit logging
- Frontend application
