-- auth 
DELIMITER $$

CREATE FUNCTION fn_staff_email_exists(p_email VARCHAR(60))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_count INT;

    SELECT COUNT(*) INTO v_count
    FROM staff
    WHERE email = p_email;

    RETURN v_count > 0;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE sp_staff_login_lookup(
    IN p_email VARCHAR(60)
)
BEGIN
    SELECT
        id,
        email,
        password,
        user_role,
        first_name,
        last_name
    FROM staff
    WHERE email = p_email
    LIMIT 1;
END$$

DELIMITER ;