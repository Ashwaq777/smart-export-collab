-- Create user_activity_logs table for audit trail
CREATE TABLE user_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    device_info VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    details TEXT
);

-- Create index on user_id for user-specific activity queries
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);

-- Create index on action for filtering by action type
CREATE INDEX idx_user_activity_logs_action ON user_activity_logs(action);

-- Create index on timestamp for time-based queries
CREATE INDEX idx_user_activity_logs_timestamp ON user_activity_logs(timestamp);

-- Create index on success for filtering successful/failed actions
CREATE INDEX idx_user_activity_logs_success ON user_activity_logs(success);
