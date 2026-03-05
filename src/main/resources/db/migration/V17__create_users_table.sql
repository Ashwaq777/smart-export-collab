-- Create users table for authentication
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'EXPORTATEUR', 'IMPORTATEUR')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BLOCKED')),
    failed_attempts INTEGER DEFAULT 0,
    lock_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create index on email for fast lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on role for admin queries
CREATE INDEX idx_users_role ON users(role);

-- Create index on status for active user queries
CREATE INDEX idx_users_status ON users(status);
