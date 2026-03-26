CREATE TABLE cont_offer_images (
    id BIGSERIAL PRIMARY KEY,
    offer_id BIGINT NOT NULL REFERENCES cont_offer(id)
        ON DELETE CASCADE,
    image_path VARCHAR(500) NOT NULL,
    image_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_offer_images_offer
    ON cont_offer_images(offer_id);
