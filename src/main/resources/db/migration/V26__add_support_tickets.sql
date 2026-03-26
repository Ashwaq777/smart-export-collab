CREATE TABLE IF NOT EXISTS support_ticket (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL 
        DEFAULT 'AUTRE',
    status VARCHAR(20) NOT NULL 
        DEFAULT 'OPEN',
    priority VARCHAR(20) NOT NULL 
        DEFAULT 'MEDIUM',
    admin_response TEXT,
    related_offer_id BIGINT,
    related_transaction_id BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_user
    ON support_ticket(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_status
    ON support_ticket(status);
