-- ============================================================
-- Add status column to reviews table
-- Migration to support status-based review moderation
-- ============================================================

-- Add status column with ENUM type
ALTER TABLE reviews 
ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' 
AFTER is_approved;

-- Migrate existing data: sync status from is_approved
-- If is_approved = TRUE, set status = 'approved'
-- If is_approved = FALSE, set status = 'pending'
UPDATE reviews 
SET status = CASE 
    WHEN is_approved = TRUE THEN 'approved'
    ELSE 'pending'
END;

-- Add index for faster status filtering
CREATE INDEX idx_status ON reviews(status);

-- ============================================================
-- Verification Query
-- ============================================================
-- Run this to verify the migration:
-- SELECT id, product_id, rating, is_approved, status FROM reviews LIMIT 10;
