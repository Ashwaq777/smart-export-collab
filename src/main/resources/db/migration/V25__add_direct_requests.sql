CREATE TABLE IF NOT EXISTS cont_direct_request (
    id BIGSERIAL PRIMARY KEY,
    offer_id BIGINT NOT NULL
        REFERENCES cont_offer(id) ON DELETE CASCADE,
    seeker_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    seeker_company VARCHAR(200),
    required_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    provider_response TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_direct_req_offer
    ON cont_direct_request(offer_id);
CREATE INDEX IF NOT EXISTS idx_direct_req_seeker
    ON cont_direct_request(seeker_id);
CREATE INDEX IF NOT EXISTS idx_direct_req_provider
    ON cont_direct_request(offer_id);
