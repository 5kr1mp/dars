
USE dars;

-- New column on staff
ALTER TABLE staff
    ADD COLUMN barangay_id INT NULL AFTER user_role,
    ADD CONSTRAINT fk_staff_barangay FOREIGN KEY (barangay_id) REFERENCES barangay(id) ON DELETE SET NULL,
    ADD INDEX idx_staff_barangay (barangay_id);

-- login proc returns barangay_id so the JWT can carry it
DROP PROCEDURE IF EXISTS sp_staff_login_lookup;
DELIMITER $$
CREATE PROCEDURE sp_staff_login_lookup(IN p_email VARCHAR(60))
BEGIN
    SELECT id, email, password, user_role, first_name, last_name, barangay_id
    FROM staff
    WHERE email = p_email
    LIMIT 1;
END$$
DELIMITER ;

-- View listing operators with their assigned barangay
DROP VIEW IF EXISTS vw_assigned_operator;
CREATE VIEW vw_assigned_operator AS
SELECT s.id          AS staff_id,
       fn_full_name(s.first_name, s.middle_name, s.last_name) AS full_name,
       s.email,
       s.contact_number,
       s.barangay_id,
       b.barangay_name
FROM staff s
JOIN barangay b ON b.id = s.barangay_id
WHERE s.user_role = 'operator';
