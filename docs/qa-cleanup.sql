-- ============================================================================
-- KISANMANDI QA TEST DATA CLEANUP SCRIPT (Task 7)
-- ============================================================================
-- WARNING:
-- 1. Take a full database backup first:
--    mysqldump -u <username> -p kisanmandi_db > backup_kisanmandi_$(date +%Y%m%d_%H%M%S).sql
-- 2. Run the PREVIEW SELECT query first to inspect every matched account.
--    Verify that ONLY test accounts (e.g. qa_farmer1@example.test) are selected.
-- 3. DO NOT use LIKE 'qa_%' because in SQL '_' is a single-character wildcard.
--    This script uses REGEXP '^qa_.*@example\\.test$' or LIKE 'qa\\_%@example.test' ESCAPE '\\'.
-- 4. Execute inside a transaction (START TRANSACTION ... COMMIT) only after manual review.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: PREVIEW SELECT (Run this first to verify accounts to be deleted)
-- ----------------------------------------------------------------------------
SELECT id, email, role, status, created_at 
FROM users 
WHERE email REGEXP '^qa_.*@example\\.test$';

-- Sanity Check: Ensure NO real accounts are matched:
SELECT id, email, role 
FROM users 
WHERE email NOT REGEXP '^qa_.*@example\\.test$';

-- ----------------------------------------------------------------------------
-- STEP 2: CLOUDINARY ASSETS IDENTIFICATION (DO NOT DELETE VIA SQL)
-- Delete these assets from the Cloudinary media dashboard manually if desired.
-- ----------------------------------------------------------------------------
-- QA Product Images:
SELECT p.id as product_id, p.name, p.image_url 
FROM products p 
JOIN users u ON p.farmer_id = u.id 
WHERE u.email REGEXP '^qa_.*@example\\.test$' 
  AND p.image_url IS NOT NULL AND p.image_url != '';

-- QA Farmer Documents:
SELECT fp.id as profile_id, fp.farm_name, fp.document_url 
FROM farmer_profiles fp 
JOIN users u ON fp.user_id = u.id 
WHERE u.email REGEXP '^qa_.*@example\\.test$' 
  AND fp.document_url IS NOT NULL AND fp.document_url != '';

-- ----------------------------------------------------------------------------
-- STEP 3: TRANSACTIONAL DELETION (IN EXACT FOREIGN KEY ORDER)
-- ----------------------------------------------------------------------------
START TRANSACTION;

-- 1. Delete Order Status History for QA Orders
DELETE FROM order_status_history 
WHERE order_id IN (
    SELECT id FROM orders 
    WHERE customer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$')
       OR farmer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$')
);

-- 2. Delete Order Items for QA Orders or QA Products
DELETE FROM order_items 
WHERE order_id IN (
    SELECT id FROM orders 
    WHERE customer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$')
       OR farmer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$')
) OR product_id IN (
    SELECT id FROM products 
    WHERE farmer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$')
);

-- 3. Delete Reviews for QA Orders or QA Farmers
DELETE FROM reviews 
WHERE order_id IN (
    SELECT id FROM orders 
    WHERE customer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$')
       OR farmer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$')
) OR farmer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$');

-- 4. Delete Cart Items for QA Customers or QA Products
DELETE FROM cart_items 
WHERE customer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$')
   OR product_id IN (
       SELECT id FROM products 
       WHERE farmer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$')
   );

-- 5. Delete Addresses belonging to QA Users
DELETE FROM addresses 
WHERE user_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$');

-- 6. Delete Orders placed by or placed to QA Users
DELETE FROM orders 
WHERE customer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$')
   OR farmer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$');

-- 7. Delete Products listed by QA Farmers
DELETE FROM products 
WHERE farmer_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$');

-- 8. Delete Farmer Profiles belonging to QA Farmers
DELETE FROM farmer_profiles 
WHERE user_id IN (SELECT id FROM users WHERE email REGEXP '^qa_.*@example\\.test$');

-- 9. Delete QA Users
DELETE FROM users 
WHERE email REGEXP '^qa_.*@example\\.test$';

-- ----------------------------------------------------------------------------
-- STEP 4: VERIFICATION
-- Check that remaining counts represent only legitimate production users.
-- ----------------------------------------------------------------------------
SELECT COUNT(*) as remaining_qa_users FROM users WHERE email REGEXP '^qa_.*@example\\.test$';

-- When satisfied, run:
-- COMMIT;
-- If any issue, run:
-- ROLLBACK;
