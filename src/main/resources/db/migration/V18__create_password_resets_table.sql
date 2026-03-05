-- Create password_resets table for password reset functionality
CREATE TABLE password_resets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on token for fast lookups during password reset
CREATE INDEX idx_password_resets_token ON password_resets(token);

-- Create index on user_id for user-specific queries
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);

-- Create index on expiry_date for cleanup of expired tokens
CREATE INDEX idx_password_resets_expiry_date ON password_resets(expiry_date);
