-- Active: 1778748742576@@127.0.0.1@3306@dars
create database dars;
use dars;

-- =====================================================
-- barangay table
-- =====================================================


CREATE TABLE IF NOT EXISTS barangay (
    id INT AUTO_INCREMENT PRIMARY KEY,

    barangay_name VARCHAR(100) UNIQUE NOT NULL,

    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    radius DECIMAL(10,2),
    CONSTRAINT chk_barangay_latitude
    CHECK (
        latitude BETWEEN -90 AND 90
    ),

    CONSTRAINT chk_barangay_longitude
    CHECK (
        longitude BETWEEN -180 AND 180
    )
);

-- =====================================================
-- staff table
-- =====================================================

CREATE TABLE IF NOT EXISTS staff (
    id INT PRIMARY KEY AUTO_INCREMENT,

    email VARCHAR(60) UNIQUE NOT NULL,
    contact_number VARCHAR(20),

    password VARCHAR(255) NOT NULL,

    first_name VARCHAR(20) NOT NULL,
    middle_name VARCHAR(15),
    last_name VARCHAR(15) NOT NULL,

    user_role ENUM(
        'system_admin',
        'admin',
        'operator'
    ) NOT NULL,

    barangay_id INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (barangay_id) REFERENCES barangay(id)
        ON DELETE SET NULL
);
-- login proc returns barangay_id so the JWT can carry it
DROP PROCEDURE IF EXISTS sp_staff_login_lookup;
DELIMITER $$
-- =====================================================
-- victim table
-- =====================================================
CREATE TABLE IF NOT EXISTS victim (
    id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARCHAR(20) NOT NULL,
    middle_name VARCHAR(15),
    last_name VARCHAR(15) NOT NULL,

    contact_number VARCHAR(20),

    email VARCHAR(60) UNIQUE,

    barangay_id INT,

    address VARCHAR(255),

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_contact_required
    CHECK (
        contact_number IS NOT NULL
        OR email IS NOT NULL
    ),

    CONSTRAINT chk_victim_email
    CHECK (
        email IS NULL
        OR email LIKE '%@%'
    ),

    FOREIGN KEY (barangay_id)
    REFERENCES barangay(id)
);
-- =====================================================
-- offender table
-- =====================================================
CREATE TABLE IF NOT EXISTS offender (
    id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARCHAR(20) NOT NULL,
    middle_name VARCHAR(15),
    last_name VARCHAR(15) NOT NULL,

    sex ENUM(
        'male',
        'female',
        'other'
    ),

    contact_number VARCHAR(20),

    address VARCHAR(255),

    barangay_id INT,

    FOREIGN KEY (barangay_id)
    REFERENCES barangay(id)
);
-- =====================================================
-- abuse_type table
-- =====================================================
CREATE TABLE IF NOT EXISTS abuse_type (
    abuse_name VARCHAR(20) PRIMARY KEY,
    abuse_description VARCHAR(100) NOT NULL,
    severity TINYINT NOT NULL,
    law_reference VARCHAR(50)
);

-- =====================================================
-- report_id_seq table  (daily sequence counter for RP-YYYYMMDD-XXXX IDs)
-- =====================================================
CREATE TABLE IF NOT EXISTS report_id_seq (
    seq_date DATE PRIMARY KEY,
    last_seq  INT UNSIGNED NOT NULL DEFAULT 0
);

-- =====================================================
-- report table
-- =====================================================
CREATE TABLE IF NOT EXISTS report (
    id VARCHAR(20) NOT NULL PRIMARY KEY,

    victim_id INT NOT NULL,
    offender_id INT,
    abuse_name VARCHAR(20) NOT NULL,
    barangay_id INT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),

    report_description TEXT,

    reported_at DATETIME
    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    report_status ENUM(
        'Reported',
        'Dispatched',
        'Under Investigation',
        'Resolved'
    )
    NOT NULL DEFAULT 'Reported',

    CONSTRAINT chk_report_latitude
    CHECK (
        latitude BETWEEN -90 AND 90
    ),

    CONSTRAINT chk_report_longitude
    CHECK (
        longitude BETWEEN -180 AND 180
    ),

    FOREIGN KEY (victim_id)
    REFERENCES victim(id)
    ON DELETE CASCADE,

    FOREIGN KEY (offender_id)
    REFERENCES offender(id)
    ON DELETE SET NULL,

    FOREIGN KEY (barangay_id)
    REFERENCES barangay(id),

    FOREIGN KEY (abuse_name)
    REFERENCES abuse_type(abuse_name)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- =====================================================
-- responder table
-- =====================================================
CREATE TABLE IF NOT EXISTS responder (
    id INT AUTO_INCREMENT PRIMARY KEY,

    responder_name VARCHAR(100) NOT NULL,

    agency VARCHAR(100),

    contact_number VARCHAR(20)
    
);
-- =====================================================
-- dispatch table
-- =====================================================

CREATE TABLE IF NOT EXISTS dispatch (
    id INT AUTO_INCREMENT PRIMARY KEY,

    report_id VARCHAR(20) NOT NULL,

    responder_id INT NOT NULL,

    dispatch_time DATETIME
    DEFAULT CURRENT_TIMESTAMP,

    dispatch_status ENUM(
        'Assigned',
        'On The Way',
        'Arrived',
        'Completed'
    )
    DEFAULT 'Assigned',

    remarks TEXT,

    FOREIGN KEY (report_id)
    REFERENCES report(id)
    ON DELETE CASCADE,

    FOREIGN KEY (responder_id)
    REFERENCES responder(id)
    ON DELETE CASCADE
);
-- =====================================================
-- resolved_report table
-- =====================================================

CREATE TABLE IF NOT EXISTS resolved_report (
    report_id VARCHAR(20)
    PRIMARY KEY,

    operator_id INT NOT NULL,

    resolution_summary TEXT,

    resolved_at DATETIME
    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (report_id)
    REFERENCES report(id)
    ON DELETE CASCADE,

    FOREIGN KEY (operator_id)
    REFERENCES staff(id)
    ON DELETE CASCADE
);

-- =====================================================
-- report_status_history table
-- =====================================================
CREATE TABLE IF NOT EXISTS report_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    report_id VARCHAR(20) NOT NULL,

    old_status VARCHAR(50),

    new_status VARCHAR(50),

    changed_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (report_id)
    REFERENCES report(id)
    ON DELETE CASCADE
);
-- =====================================================
-- log table
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    table_name VARCHAR(50) NOT NULL,

    action_type ENUM(
        'INSERT',
        'UPDATE',
        'DELETE'
    ) NOT NULL,

    record_id VARCHAR(50) NOT NULL,

    performed_by INT NULL,

    old_values JSON NULL,

    new_values JSON NULL,

    action_timestamp DATETIME
    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- REPORT TABLE INDEXES
-- =====================================================

CREATE INDEX idx_report_status
ON report(report_status);

CREATE INDEX idx_staff_barangay
ON staff(barangay_id);

CREATE INDEX idx_report_date
ON report(reported_at);

CREATE INDEX idx_report_barangay
ON report(barangay_id);

CREATE INDEX idx_report_abuse
ON report(abuse_name);

CREATE INDEX idx_report_victim
ON report(victim_id);

CREATE INDEX idx_report_offender
ON report(offender_id);

-- =====================================================
-- DISPATCH TABLE INDEXES
-- =====================================================

CREATE INDEX idx_dispatch_report
ON dispatch(report_id);

CREATE INDEX idx_dispatch_responder
ON dispatch(responder_id);

CREATE INDEX idx_dispatch_status
ON dispatch(dispatch_status);

CREATE INDEX idx_dispatch_time
ON dispatch(dispatch_time);

-- =====================================================
-- STATUS HISTORY INDEXES
-- =====================================================

CREATE INDEX idx_history_report
ON report_status_history(report_id);

CREATE INDEX idx_history_date
ON report_status_history(changed_at);


-- =====================================================
-- AUDIT LOG INDEXES
-- =====================================================

CREATE INDEX idx_audit_table
ON audit_log(table_name);

CREATE INDEX idx_audit_action
ON audit_log(action_type);

CREATE INDEX idx_audit_timestamp
ON audit_log(action_timestamp);


-- =====================================================
-- BARANGAY INDEXES
-- =====================================================

CREATE INDEX idx_barangay_name
ON barangay(barangay_name);


-- =====================================================
-- ABUSE TYPE INDEXES
-- =====================================================

CREATE INDEX idx_abuse_severity
ON abuse_type(severity);

DELIMITER $$

-- ----------------------------------------------------
-- returns "First [M.] Last"
-- ----------------------------------------------------
DROP FUNCTION IF EXISTS fn_full_name$$
CREATE FUNCTION fn_full_name(
    p_first  VARCHAR(20),
    p_middle VARCHAR(15),
    p_last   VARCHAR(15)
)
RETURNS VARCHAR(60)
DETERMINISTIC
BEGIN
    IF p_middle IS NOT NULL AND p_middle != '' THEN
        RETURN CONCAT(p_first, ' ', LEFT(p_middle, 1), '. ', p_last);
    ELSE
        RETURN CONCAT(p_first, ' ', p_last);
    END IF;
END$$

-- ----------------------------------------------------
-- days since a report was filed
-- ----------------------------------------------------
DROP FUNCTION IF EXISTS fn_report_age_days$$
CREATE FUNCTION fn_report_age_days(p_reported_at DATETIME)
RETURNS INT
DETERMINISTIC
BEGIN
    RETURN DATEDIFF(NOW(), p_reported_at);
END$$

-- ----------------------------------------------------
-- maps severity tinyint to label
-- ----------------------------------------------------
DROP FUNCTION IF EXISTS fn_severity_label$$
CREATE FUNCTION fn_severity_label(p_severity TINYINT)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    RETURN CASE
        WHEN p_severity <= 3  THEN 'Low'
        WHEN p_severity <= 6  THEN 'Moderate'
        WHEN p_severity <= 8  THEN 'High'
        ELSE                       'Critical'
    END;
END$$

-- ----------------------------------------------------
-- total dispatches for a report
-- ----------------------------------------------------
DROP FUNCTION IF EXISTS fn_dispatch_count$$
CREATE FUNCTION fn_dispatch_count(p_report_id VARCHAR(20))
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count
    FROM dispatch
    WHERE report_id = p_report_id;
    RETURN v_count;
END$$

-- ----------------------------------------------------
-- num of reports in a barangay
-- ----------------------------------------------------
DROP FUNCTION IF EXISTS fn_barangay_report_count$$
CREATE FUNCTION fn_barangay_report_count(p_barangay_id INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count
    FROM report
    WHERE barangay_id = p_barangay_id
      AND report_status <> 'Resolved';
    RETURN v_count;
END$$

-- ----------------------------------------------------
-- generate next report ID in RP-YYYYMMDD-XXXX format
-- ----------------------------------------------------
DROP FUNCTION IF EXISTS fn_generate_report_id$$
CREATE FUNCTION fn_generate_report_id()
RETURNS VARCHAR(20)
MODIFIES SQL DATA
NOT DETERMINISTIC
BEGIN
    DECLARE v_date DATE;
    DECLARE v_seq  INT UNSIGNED;

    SET v_date = CURDATE();

    INSERT INTO report_id_seq (seq_date, last_seq)
    VALUES (v_date, 1)
    ON DUPLICATE KEY UPDATE last_seq = last_seq + 1;

    SELECT last_seq INTO v_seq
    FROM report_id_seq
    WHERE seq_date = v_date;

    RETURN CONCAT('RP-', DATE_FORMAT(v_date, '%Y%m%d'), '-', LPAD(v_seq, 4, '0'));
END$$

DELIMITER ;

-- ----------------------------------------------------
-- Staff with email exists (boolean)
-- ----------------------------------------------------
DROP FUNCTION IF EXISTS fn_staff_email_exists$$
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


-- ----------------------------------------------------
-- barangay list with open report count
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_barangay AS
SELECT
    b.id                                        AS barangay_id,
    b.barangay_name,
    b.latitude,
    b.longitude,
    b.radius,
    fn_barangay_report_count(b.id)              AS open_report_count
FROM barangay b;

-- ----------------------------------------------------
-- staff list (no password)
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_staff AS
SELECT
    s.id                                        AS staff_id,
    fn_full_name(s.first_name, s.middle_name, s.last_name)
                                                AS full_name,
    s.email,
    s.user_role,
    s.contact_number,
    s.created_at
FROM staff s;

-- ----------------------------------------------------
-- victim with barangay name & full name
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_victim AS
SELECT
    v.id                                        AS victim_id,
    fn_full_name(v.first_name, v.middle_name, v.last_name)
                                                AS full_name,
    v.contact_number,
    v.email,
    v.address,
    b.barangay_name,
    v.created_at
FROM victim v
LEFT JOIN barangay b ON b.id = v.barangay_id;

-- ----------------------------------------------------
-- offender with barangay name & full name
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_offender AS
SELECT
    o.id                                        AS offender_id,
    fn_full_name(o.first_name, o.middle_name, o.last_name)
                                                AS full_name,
    o.sex,
    o.contact_number,
    o.address,
    b.barangay_name
FROM offender o
LEFT JOIN barangay b ON b.id = o.barangay_id;

-- ----------------------------------------------------
-- abuse types with severity label
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_abuse_type AS
SELECT
    a.abuse_name,
    a.abuse_description,
    a.severity,
    fn_severity_label(a.severity)               AS severity_label,
    a.law_reference
FROM abuse_type a;

-- ----------------------------------------------------
-- full report details
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_report AS
SELECT
    r.id                                        AS report_id,
    r.report_status,
    r.reported_at,
    fn_report_age_days(r.reported_at)           AS age_days,
    fn_dispatch_count(r.id)                     AS dispatch_count,

    -- Victim
    fn_full_name(v.first_name, v.middle_name, v.last_name)
                                                AS victim_name,
    v.contact_number                            AS victim_contact,

    -- Offender (nullable)
    fn_full_name(o.first_name, o.middle_name, o.last_name)
                                                AS offender_name,
    o.sex                                       AS offender_sex,

    -- Abuse
    r.abuse_name,
    at.severity,
    fn_severity_label(at.severity)              AS severity_label,

    -- Location
    b.barangay_name,
    r.latitude,
    r.longitude,
    r.report_description
FROM report r
JOIN    victim     v  ON v.id         = r.victim_id
LEFT JOIN offender o  ON o.id         = r.offender_id
JOIN    barangay   b  ON b.id         = r.barangay_id
JOIN    abuse_type at ON at.abuse_name = r.abuse_name;

-- ----------------------------------------------------
-- dispatch with responder & report info
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_dispatch AS
SELECT
    d.id                                        AS dispatch_id,
    d.dispatch_status,
    d.dispatch_time,
    d.remarks,

    -- Report
    r.id                                        AS report_id,
    r.report_status,
    b.barangay_name,

    -- Responder
    rs.id                                       AS responder_id,
    rs.responder_name,
    rs.agency,
    rs.contact_number                           AS responder_contact
FROM dispatch d
JOIN report    r  ON r.id  = d.report_id
JOIN barangay  b  ON b.id  = r.barangay_id
JOIN responder rs ON rs.id = d.responder_id;

-- ----------------------------------------------------
-- resolved reports with operator
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_resolved_report AS
SELECT
    rr.report_id,
    rr.resolved_at,
    rr.resolution_summary,
    fn_full_name(s.first_name, s.middle_name, s.last_name)
                                                AS resolved_by,
    s.user_role                                 AS operator_role,

    -- Original report info
    fn_full_name(v.first_name, v.middle_name, v.last_name)
                                                AS victim_name,
    r.abuse_name,
    fn_severity_label(at.severity)              AS severity_label,
    b.barangay_name
FROM resolved_report rr
JOIN staff       s   ON s.id          = rr.operator_id
JOIN report      r   ON r.id          = rr.report_id
JOIN victim      v   ON v.id          = r.victim_id
JOIN barangay    b   ON b.id          = r.barangay_id
JOIN abuse_type  at  ON at.abuse_name = r.abuse_name;

-- ----------------------------------------------------
-- audit trail per report
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_report_status_history AS
SELECT
    h.id                                        AS history_id,
    h.report_id,
    h.old_status,
    h.new_status,
    h.changed_at,
    b.barangay_name,
    fn_full_name(v.first_name, v.middle_name, v.last_name)
                                                AS victim_name
FROM report_status_history h
JOIN report   r ON r.id = h.report_id
JOIN victim   v ON v.id = r.victim_id
JOIN barangay b ON b.id = r.barangay_id;

-- ----------------------------------------------------
-- human-readable audit log
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_audit_log AS
SELECT
    al.id                                       AS log_id,
    al.action_timestamp,
    al.table_name,
    al.action_type,
    al.record_id,
    fn_full_name(s.first_name, s.middle_name, s.last_name)
                                                AS performed_by,
    s.user_role,
    al.old_values,
    al.new_values
FROM audit_log al
LEFT JOIN staff s ON s.id = al.performed_by;

-- ----------------------------------------------------
-- human-readable audit log
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_assigned_operator AS
SELECT s.id AS staff_id,
       fn_full_name(s.first_name, s.middle_name, s.last_name) AS full_name,
       s.email,
       s.contact_number,
       s.barangay_id,
       b.barangay_name
FROM staff s
JOIN barangay b ON b.id = s.barangay_id
WHERE s.user_role = 'operator';

-- ----------------------------------------------------
--  responder summary
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_responder AS
SELECT
    r.id AS responder_id,
    r.responder_name,
    r.agency,
    r.contact_number,
    COUNT(d.id) AS total_dispatches,
    COALESCE(SUM(d.dispatch_status = 'Completed'),0) AS completed_dispatches
FROM responder r
LEFT JOIN dispatch d ON d.responder_id = r.id
GROUP BY r.id, r.responder_name, r.agency, r.contact_number;



DELIMITER $$

-- =============================================
-- BARANGAY procedures
-- =============================================

DROP PROCEDURE IF EXISTS sp_barangay_create$$
CREATE PROCEDURE sp_barangay_create(
    IN p_name       VARCHAR(100),
    IN p_latitude   DECIMAL(10,8),
    IN p_longitude  DECIMAL(11,8),
    IN p_radius     DECIMAL(10,2)
)
BEGIN
    INSERT INTO barangay (barangay_name, latitude, longitude, radius)
    VALUES (p_name, p_latitude, p_longitude, p_radius);
    SELECT LAST_INSERT_ID() AS new_barangay_id;
END$$

DROP PROCEDURE IF EXISTS sp_barangay_get$$
CREATE PROCEDURE sp_barangay_get(IN p_id INT)
BEGIN
    IF p_id IS NULL THEN
        SELECT * FROM vw_barangay ORDER BY barangay_name;
    ELSE
        SELECT * FROM vw_barangay WHERE barangay_id = p_id;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_barangay_update$$
CREATE PROCEDURE sp_barangay_update(
    IN p_id         INT,
    IN p_name       VARCHAR(100),
    IN p_latitude   DECIMAL(10,8),
    IN p_longitude  DECIMAL(11,8),
    IN p_radius     DECIMAL(10,2)
)
BEGIN
    UPDATE barangay
    SET barangay_name = COALESCE(p_name,      barangay_name),
        latitude      = COALESCE(p_latitude,  latitude),
        longitude     = COALESCE(p_longitude, longitude),
        radius        = COALESCE(p_radius,    radius)
    WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

DROP PROCEDURE IF EXISTS sp_barangay_delete$$
CREATE PROCEDURE sp_barangay_delete(IN p_id INT)
BEGIN
    DELETE FROM barangay WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

-- =============================================
-- STAFF procedures
-- =============================================

DROP PROCEDURE IF EXISTS sp_staff_create$$
CREATE PROCEDURE sp_staff_create(
    IN p_email          VARCHAR(60),
    IN p_password       VARCHAR(255),
    IN p_first_name     VARCHAR(20),
    IN p_middle_name    VARCHAR(15),
    IN p_last_name      VARCHAR(15),
    IN p_user_role      ENUM('system_admin','admin','operator'),
    IN p_contact_number VARCHAR(15)
)
BEGIN
    INSERT INTO staff (
        email,
        password,
        first_name,
        middle_name,
        last_name,
        user_role,
        contact_number
    )
    VALUES (
        p_email,
        p_password,
        p_first_name,
        p_middle_name,
        p_last_name,
        p_user_role,
        p_contact_number
    );

    SELECT 
        id,
        email,
        first_name,
        middle_name,
        last_name,
        user_role,
        contact_number,
        created_at
    FROM staff
    WHERE id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS sp_staff_get$$
CREATE PROCEDURE sp_staff_get(IN p_id INT)
BEGIN
    IF p_id IS NULL THEN
        SELECT * FROM vw_staff ORDER BY full_name;
    ELSE
        SELECT * FROM vw_staff WHERE staff_id = p_id;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_staff_update$$
CREATE PROCEDURE sp_staff_update(
    IN p_id             INT,
    IN p_email          VARCHAR(60),
    IN p_first_name     VARCHAR(20),
    IN p_middle_name    VARCHAR(15),
    IN p_last_name      VARCHAR(15),
    IN p_user_role      ENUM('system_admin','admin','operator'),
    IN p_contact_number VARCHAR(15)
)
BEGIN
    UPDATE staff
    SET email          = COALESCE(p_email,          email),
        first_name     = COALESCE(p_first_name,     first_name),
        middle_name    = COALESCE(p_middle_name,    middle_name),
        last_name      = COALESCE(p_last_name,      last_name),
        user_role      = COALESCE(p_user_role,      user_role),
        contact_number = COALESCE(p_contact_number, contact_number)
    WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

DROP PROCEDURE IF EXISTS sp_staff_change_password$$
CREATE PROCEDURE sp_staff_change_password(
    IN p_id       INT,
    IN p_new_hash VARCHAR(255)
)
BEGIN
    UPDATE staff SET password = p_new_hash WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

DROP PROCEDURE IF EXISTS sp_staff_delete$$
CREATE PROCEDURE sp_staff_delete(IN p_id INT)
BEGIN
    DELETE FROM staff WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

DROP PROCEDURE IF EXISTS sp_staff_login_lookup$$

CREATE PROCEDURE sp_staff_login_lookup(
    IN p_email VARCHAR(60)
)
BEGIN
    SELECT
        s.id,
        s.email,
        s.password,
        s.user_role,
        s.first_name,
        s.last_name,
        b.id,
        b.barangay_name
    FROM staff as s
    INNER JOIN barangay as b ON s.barangay_id = b.id 
    WHERE s.email = p_email
    LIMIT 1;
END$$
-- =============================================
-- VICTIM procedures
-- =============================================

DROP PROCEDURE IF EXISTS sp_victim_create$$
CREATE PROCEDURE sp_victim_create(
    IN p_first_name      VARCHAR(20),
    IN p_middle_name     VARCHAR(15),
    IN p_last_name       VARCHAR(15),
    IN p_contact_number  VARCHAR(20),
    IN p_email           VARCHAR(60),
    IN p_barangay_id     INT,
    IN p_address         VARCHAR(255)
)
BEGIN
    INSERT INTO victim (first_name, middle_name, last_name, contact_number, email, barangay_id, address)
    VALUES (p_first_name, p_middle_name, p_last_name, p_contact_number, p_email, p_barangay_id, p_address);
    SELECT LAST_INSERT_ID() AS new_victim_id;
END$$

DROP PROCEDURE IF EXISTS sp_victim_get$$
CREATE PROCEDURE sp_victim_get(IN p_id INT)
BEGIN
    IF p_id IS NULL THEN
        SELECT * FROM vw_victim ORDER BY full_name;
    ELSE
        SELECT * FROM vw_victim WHERE victim_id = p_id;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_victim_update$$
CREATE PROCEDURE sp_victim_update(
    IN p_id              INT,
    IN p_first_name      VARCHAR(20),
    IN p_middle_name     VARCHAR(15),
    IN p_last_name       VARCHAR(15),
    IN p_contact_number  VARCHAR(20),
    IN p_email           VARCHAR(60),
    IN p_barangay_id     INT,
    IN p_address         VARCHAR(255)
)
BEGIN
    UPDATE victim
    SET first_name     = COALESCE(p_first_name,     first_name),
        middle_name    = COALESCE(p_middle_name,    middle_name),
        last_name      = COALESCE(p_last_name,      last_name),
        contact_number = COALESCE(p_contact_number, contact_number),
        email          = COALESCE(p_email,          email),
        barangay_id    = COALESCE(p_barangay_id,    barangay_id),
        address        = COALESCE(p_address,        address)
    WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

DROP PROCEDURE IF EXISTS sp_victim_delete$$
CREATE PROCEDURE sp_victim_delete(IN p_id INT)
BEGIN
    DELETE FROM victim WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

-- =============================================
-- OFFENDER procedures
-- =============================================

DROP PROCEDURE IF EXISTS sp_offender_create$$
CREATE PROCEDURE sp_offender_create(
    IN p_first_name     VARCHAR(20),
    IN p_middle_name    VARCHAR(15),
    IN p_last_name      VARCHAR(15),
    IN p_sex            ENUM('male','female','other'),
    IN p_contact_number VARCHAR(20),
    IN p_address        VARCHAR(255),
    IN p_barangay_id    INT
)
BEGIN
    INSERT INTO offender (first_name, middle_name, last_name, sex, contact_number, address, barangay_id)
    VALUES (p_first_name, p_middle_name, p_last_name, p_sex, p_contact_number, p_address, p_barangay_id);
    SELECT LAST_INSERT_ID() AS new_offender_id;
END$$

DROP PROCEDURE IF EXISTS sp_offender_get$$
CREATE PROCEDURE sp_offender_get(IN p_id INT)
BEGIN
    IF p_id IS NULL THEN
        SELECT * FROM vw_offender ORDER BY full_name;
    ELSE
        SELECT * FROM vw_offender WHERE offender_id = p_id;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_offender_update$$
CREATE PROCEDURE sp_offender_update(
    IN p_id             INT,
    IN p_first_name     VARCHAR(20),
    IN p_middle_name    VARCHAR(15),
    IN p_last_name      VARCHAR(15),
    IN p_sex            ENUM('male','female','other'),
    IN p_contact_number VARCHAR(20),
    IN p_address        VARCHAR(255),
    IN p_barangay_id    INT
)
BEGIN
    UPDATE offender
    SET first_name     = COALESCE(p_first_name,     first_name),
        middle_name    = COALESCE(p_middle_name,    middle_name),
        last_name      = COALESCE(p_last_name,      last_name),
        sex            = COALESCE(p_sex,            sex),
        contact_number = COALESCE(p_contact_number, contact_number),
        address        = COALESCE(p_address,        address),
        barangay_id    = COALESCE(p_barangay_id,    barangay_id)
    WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

DROP PROCEDURE IF EXISTS sp_offender_delete$$
CREATE PROCEDURE sp_offender_delete(IN p_id INT)
BEGIN
    DELETE FROM offender WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

-- =============================================
-- ABUSE TYPE procedures
-- =============================================

DROP PROCEDURE IF EXISTS sp_abuse_type_create$$
CREATE PROCEDURE sp_abuse_type_create(
    IN p_abuse_name        VARCHAR(20),
    IN p_abuse_description VARCHAR(100),
    IN p_severity          TINYINT,
    IN p_law_reference     VARCHAR(50)
)
BEGIN
    INSERT INTO abuse_type (abuse_name, abuse_description, severity, law_reference)
    VALUES (p_abuse_name, p_abuse_description, p_severity, p_law_reference);
    SELECT p_abuse_name AS created_abuse_name;
END$$

DROP PROCEDURE IF EXISTS sp_abuse_type_get$$
CREATE PROCEDURE sp_abuse_type_get(IN p_abuse_name VARCHAR(20))
BEGIN
    IF p_abuse_name IS NULL THEN
        SELECT * FROM vw_abuse_type ORDER BY severity DESC;
    ELSE
        SELECT * FROM vw_abuse_type WHERE abuse_name = p_abuse_name;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_abuse_type_update$$
CREATE PROCEDURE sp_abuse_type_update(
    IN p_abuse_name        VARCHAR(20),
    IN p_abuse_description VARCHAR(100),
    IN p_severity          TINYINT,
    IN p_law_reference     VARCHAR(50)
)
BEGIN
    UPDATE abuse_type
    SET abuse_description = COALESCE(p_abuse_description, abuse_description),
        severity          = COALESCE(p_severity,          severity),
        law_reference     = COALESCE(p_law_reference,     law_reference)
    WHERE abuse_name = p_abuse_name;
    SELECT ROW_COUNT() AS rows_affected;
END$$

DROP PROCEDURE IF EXISTS sp_abuse_type_delete$$
CREATE PROCEDURE sp_abuse_type_delete(IN p_abuse_name VARCHAR(20))
BEGIN
    DELETE FROM abuse_type WHERE abuse_name = p_abuse_name;
    SELECT ROW_COUNT() AS rows_affected;
END$$

-- =============================================
-- REPORT procedures
-- =============================================
-- UPDATED PROCEDUR
DROP PROCEDURE IF EXISTS sp_report_create$$
CREATE PROCEDURE sp_report_create(
    IN p_victim_id          INT,
    IN p_offender_id        INT,
    IN p_abuse_name         VARCHAR(20),
    IN p_barangay_id        INT,
    IN p_latitude           DECIMAL(10,8),
    IN p_longitude          DECIMAL(11,8),
    IN p_report_description TEXT
)
BEGIN
    DECLARE v_id VARCHAR(20);
    SET v_id = fn_generate_report_id();

    INSERT INTO report
        (id, victim_id, offender_id, abuse_name, barangay_id, latitude, longitude, report_description)
    VALUES
        (v_id, p_victim_id, p_offender_id, p_abuse_name, p_barangay_id, p_latitude, p_longitude, p_report_description);

    SELECT v_id AS new_report_id;
END$$

DROP PROCEDURE IF EXISTS sp_report_get$$
CREATE PROCEDURE sp_report_get(IN p_id VARCHAR(20))
BEGIN
    IF p_id IS NULL THEN
        SELECT * FROM vw_report ORDER BY reported_at DESC;
    ELSE
        SELECT * FROM vw_report WHERE report_id = p_id;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_report_get_by_status$$
CREATE PROCEDURE sp_report_get_by_status(IN p_status VARCHAR(50))
BEGIN
    SELECT * FROM vw_report
    WHERE report_status = p_status
    ORDER BY reported_at DESC;
END$$

DROP PROCEDURE IF EXISTS sp_report_get_by_barangay$$
CREATE PROCEDURE sp_report_get_by_barangay(IN p_barangay_id INT)
BEGIN
    SELECT * FROM vw_report
    WHERE barangay_name = (SELECT barangay_name FROM barangay WHERE id = p_barangay_id)
    ORDER BY reported_at DESC;
END$$

DROP PROCEDURE IF EXISTS sp_report_update_status$$
CREATE PROCEDURE sp_report_update_status(
    IN p_id          VARCHAR(20),
    IN p_new_status  ENUM('Reported','Dispatched','Under Investigation','Resolved'),
    IN p_staff_id    INT
)
BEGIN
    UPDATE report SET report_status = p_new_status WHERE id = p_id;

    -- Record who changed the status in audit_log
    INSERT INTO audit_log (table_name, action_type, record_id, performed_by, new_values)
    VALUES ('report', 'UPDATE', p_id, p_staff_id,
        JSON_OBJECT('report_status', p_new_status)
    );
    SELECT ROW_COUNT() AS rows_affected;
END$$

DROP PROCEDURE IF EXISTS sp_report_update$$
CREATE PROCEDURE sp_report_update(
    IN p_id                 VARCHAR(20),
    IN p_offender_id        INT,
    IN p_report_description TEXT,
    IN p_latitude           DECIMAL(10,8),
    IN p_longitude          DECIMAL(11,8)
)
BEGIN
    UPDATE report
    SET offender_id        = COALESCE(p_offender_id,        offender_id),
        report_description = COALESCE(p_report_description, report_description),
        latitude           = COALESCE(p_latitude,           latitude),
        longitude          = COALESCE(p_longitude,          longitude)
    WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

DROP PROCEDURE IF EXISTS sp_report_delete$$
CREATE PROCEDURE sp_report_delete(IN p_id VARCHAR(20))
BEGIN
    DELETE FROM report WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

-- =============================================
-- RESPONDER procedures
-- =============================================

DROP PROCEDURE IF EXISTS sp_responder_create$$
CREATE PROCEDURE sp_responder_create(
    IN p_responder_name VARCHAR(100),
    IN p_agency         VARCHAR(100),
    IN p_contact_number VARCHAR(20)
)
BEGIN
    INSERT INTO responder (responder_name, agency, contact_number)
    VALUES (p_responder_name, p_agency, p_contact_number);
    SELECT LAST_INSERT_ID() AS new_responder_id;
END$$

DROP PROCEDURE IF EXISTS sp_responder_get$$
CREATE PROCEDURE sp_responder_get(IN p_id INT)
BEGIN
    IF p_id IS NULL THEN
        SELECT * FROM vw_responder ORDER BY responder_name;
    ELSE
        SELECT * FROM vw_responder WHERE responder_id = p_id;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_responder_update$$
CREATE PROCEDURE sp_responder_update(
    IN p_id             INT,
    IN p_responder_name VARCHAR(100),
    IN p_agency         VARCHAR(100),
    IN p_contact_number VARCHAR(20)
)
BEGIN
    UPDATE responder
    SET responder_name = COALESCE(p_responder_name, responder_name),
        agency         = COALESCE(p_agency,         agency),
        contact_number = COALESCE(p_contact_number, contact_number)
    WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

DROP PROCEDURE IF EXISTS sp_responder_delete$$
CREATE PROCEDURE sp_responder_delete(IN p_id INT)
BEGIN
    DELETE FROM responder WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

-- =============================================
-- DISPATCH procedures
-- =============================================

DROP PROCEDURE IF EXISTS sp_dispatch_create$$
CREATE PROCEDURE sp_dispatch_create(
    IN p_report_id    VARCHAR(20),
    IN p_responder_id INT,
    IN p_remarks      TEXT
)
BEGIN
    INSERT INTO dispatch (report_id, responder_id, remarks)
    VALUES (p_report_id, p_responder_id, p_remarks);
    SELECT LAST_INSERT_ID() AS new_dispatch_id;
END$$

DROP PROCEDURE IF EXISTS sp_dispatch_get$$
CREATE PROCEDURE sp_dispatch_get(IN p_id INT)
BEGIN
    IF p_id IS NULL THEN
        SELECT * FROM vw_dispatch ORDER BY dispatch_time DESC;
    ELSE
        SELECT * FROM vw_dispatch WHERE dispatch_id = p_id;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_dispatch_get_by_report$$
CREATE PROCEDURE sp_dispatch_get_by_report(IN p_report_id VARCHAR(20))
BEGIN
    SELECT * FROM vw_dispatch WHERE report_id = p_report_id ORDER BY dispatch_time DESC;
END$$

DROP PROCEDURE IF EXISTS sp_dispatch_update_status$$
CREATE PROCEDURE sp_dispatch_update_status(
    IN p_id      INT,
    IN p_status  ENUM('Assigned','On The Way','Arrived','Completed'),
    IN p_remarks TEXT
)
BEGIN
    UPDATE dispatch
    SET dispatch_status = p_status,
        remarks         = COALESCE(p_remarks, remarks)
    WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

DROP PROCEDURE IF EXISTS sp_dispatch_delete$$
CREATE PROCEDURE sp_dispatch_delete(IN p_id INT)
BEGIN
    DELETE FROM dispatch WHERE id = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

-- =============================================
-- RESOLVED REPORT procedures
-- =============================================

DROP PROCEDURE IF EXISTS sp_resolved_report_create$$
CREATE PROCEDURE sp_resolved_report_create(
    IN p_report_id          VARCHAR(20),
    IN p_operator_id        INT,
    IN p_resolution_summary TEXT
)
BEGIN
    INSERT INTO resolved_report (report_id, operator_id, resolution_summary)
    VALUES (p_report_id, p_operator_id, p_resolution_summary);
    SELECT p_report_id AS resolved_report_id;
END$$

DROP PROCEDURE IF EXISTS sp_resolved_report_get$$
CREATE PROCEDURE sp_resolved_report_get(IN p_report_id VARCHAR(20))
BEGIN
    IF p_report_id IS NULL THEN
        SELECT * FROM vw_resolved_report ORDER BY resolved_at DESC;
    ELSE
        SELECT * FROM vw_resolved_report WHERE report_id = p_report_id;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_resolved_report_update$$
CREATE PROCEDURE sp_resolved_report_update(
    IN p_report_id          VARCHAR(20),
    IN p_resolution_summary TEXT
)
BEGIN
    UPDATE resolved_report
    SET resolution_summary = p_resolution_summary
    WHERE report_id = p_report_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

DROP PROCEDURE IF EXISTS sp_resolved_report_delete$$
CREATE PROCEDURE sp_resolved_report_delete(IN p_report_id VARCHAR(20))
BEGIN
    DELETE FROM resolved_report WHERE report_id = p_report_id;
    SELECT ROW_COUNT() AS rows_affected;
END$$

-- =============================================
-- AUDIT LOG procedures (read-only CRUD)
-- =============================================

DROP PROCEDURE IF EXISTS sp_audit_log_get$$
CREATE PROCEDURE sp_audit_log_get(
    IN p_table_name  VARCHAR(50),
    IN p_action_type ENUM('INSERT','UPDATE','DELETE'),
    IN p_limit       INT
)
BEGIN
    SET p_limit = COALESCE(p_limit, 100);

    SELECT * FROM vw_audit_log
    WHERE (p_table_name  IS NULL OR table_name  = p_table_name)
      AND (p_action_type IS NULL OR action_type = p_action_type)
    ORDER BY action_timestamp DESC
    LIMIT p_limit;
END$$

DROP PROCEDURE IF EXISTS sp_audit_log_purge$$
CREATE PROCEDURE sp_audit_log_purge(IN p_before_date DATETIME)
BEGIN
    DELETE FROM audit_log WHERE action_timestamp < p_before_date;
    SELECT ROW_COUNT() AS rows_deleted;
END$$

-- =============================================
-- REPORT STATUS HISTORY procedure
-- =============================================

DROP PROCEDURE IF EXISTS sp_report_status_history_get$$
CREATE PROCEDURE sp_report_status_history_get(IN p_report_id VARCHAR(20))
BEGIN
    SELECT * FROM vw_report_status_history
    WHERE report_id = p_report_id
    ORDER BY changed_at ASC;
END$$

DELIMITER ;



DELIMITER $$

-- =============================================
-- barangay triggers
-- =============================================
DROP TRIGGER IF EXISTS trg_barangay_after_insert$$
CREATE TRIGGER trg_barangay_after_insert
AFTER INSERT ON barangay
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, new_values)
    VALUES ('barangay', 'INSERT', NEW.id,
        JSON_OBJECT(
            'barangay_name', NEW.barangay_name,
            'latitude',      NEW.latitude,
            'longitude',     NEW.longitude,
            'radius',        NEW.radius
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_barangay_after_update$$
CREATE TRIGGER trg_barangay_after_update
AFTER UPDATE ON barangay
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values, new_values)
    VALUES ('barangay', 'UPDATE', NEW.id,
        JSON_OBJECT(
            'barangay_name', OLD.barangay_name,
            'latitude',      OLD.latitude,
            'longitude',     OLD.longitude,
            'radius',        OLD.radius
        ),
        JSON_OBJECT(
            'barangay_name', NEW.barangay_name,
            'latitude',      NEW.latitude,
            'longitude',     NEW.longitude,
            'radius',        NEW.radius
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_barangay_after_delete$$
CREATE TRIGGER trg_barangay_after_delete
AFTER DELETE ON barangay
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values)
    VALUES ('barangay', 'DELETE', OLD.id,
        JSON_OBJECT(
            'barangay_name', OLD.barangay_name,
            'latitude',      OLD.latitude,
            'longitude',     OLD.longitude,
            'radius',        OLD.radius
        )
    );
END$$

-- =============================================
-- staff triggers
-- =============================================
DROP TRIGGER IF EXISTS trg_staff_after_insert$$
CREATE TRIGGER trg_staff_after_insert
AFTER INSERT ON staff
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, new_values)
    VALUES ('staff', 'INSERT', NEW.id,
        JSON_OBJECT(
            'email',      NEW.email,
            'first_name', NEW.first_name,
            'last_name',  NEW.last_name,
            'user_role',  NEW.user_role
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_staff_after_update$$
CREATE TRIGGER trg_staff_after_update
AFTER UPDATE ON staff
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values, new_values)
    VALUES ('staff', 'UPDATE', NEW.id,
        JSON_OBJECT(
            'email',      OLD.email,
            'first_name', OLD.first_name,
            'last_name',  OLD.last_name,
            'user_role',  OLD.user_role
        ),
        JSON_OBJECT(
            'email',      NEW.email,
            'first_name', NEW.first_name,
            'last_name',  NEW.last_name,
            'user_role',  NEW.user_role
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_staff_after_delete$$
CREATE TRIGGER trg_staff_after_delete
AFTER DELETE ON staff
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values)
    VALUES ('staff', 'DELETE', OLD.id,
        JSON_OBJECT(
            'email',      OLD.email,
            'first_name', OLD.first_name,
            'last_name',  OLD.last_name,
            'user_role',  OLD.user_role
        )
    );
END$$

-- =============================================
-- victim triggers
-- =============================================
DROP TRIGGER IF EXISTS trg_victim_after_insert$$
CREATE TRIGGER trg_victim_after_insert
AFTER INSERT ON victim
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, new_values)
    VALUES ('victim', 'INSERT', NEW.id,
        JSON_OBJECT(
            'first_name',      NEW.first_name,
            'last_name',       NEW.last_name,
            'contact_number',  NEW.contact_number,
            'email',           NEW.email,
            'barangay_id',     NEW.barangay_id
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_victim_after_update$$
CREATE TRIGGER trg_victim_after_update
AFTER UPDATE ON victim
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values, new_values)
    VALUES ('victim', 'UPDATE', NEW.id,
        JSON_OBJECT(
            'first_name',     OLD.first_name,
            'last_name',      OLD.last_name,
            'contact_number', OLD.contact_number,
            'email',          OLD.email,
            'barangay_id',    OLD.barangay_id
        ),
        JSON_OBJECT(
            'first_name',     NEW.first_name,
            'last_name',      NEW.last_name,
            'contact_number', NEW.contact_number,
            'email',          NEW.email,
            'barangay_id',    NEW.barangay_id
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_victim_after_delete$$
CREATE TRIGGER trg_victim_after_delete
AFTER DELETE ON victim
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values)
    VALUES ('victim', 'DELETE', OLD.id,
        JSON_OBJECT(
            'first_name',     OLD.first_name,
            'last_name',      OLD.last_name,
            'contact_number', OLD.contact_number,
            'email',          OLD.email,
            'barangay_id',    OLD.barangay_id
        )
    );
END$$

-- =============================================
-- offender triggers
-- =============================================
DROP TRIGGER IF EXISTS trg_offender_after_insert$$
CREATE TRIGGER trg_offender_after_insert
AFTER INSERT ON offender
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, new_values)
    VALUES ('offender', 'INSERT', NEW.id,
        JSON_OBJECT(
            'first_name',     NEW.first_name,
            'last_name',      NEW.last_name,
            'sex',            NEW.sex,
            'contact_number', NEW.contact_number,
            'barangay_id',    NEW.barangay_id
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_offender_after_update$$
CREATE TRIGGER trg_offender_after_update
AFTER UPDATE ON offender
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values, new_values)
    VALUES ('offender', 'UPDATE', NEW.id,
        JSON_OBJECT(
            'first_name',     OLD.first_name,
            'last_name',      OLD.last_name,
            'sex',            OLD.sex,
            'contact_number', OLD.contact_number,
            'barangay_id',    OLD.barangay_id
        ),
        JSON_OBJECT(
            'first_name',     NEW.first_name,
            'last_name',      NEW.last_name,
            'sex',            NEW.sex,
            'contact_number', NEW.contact_number,
            'barangay_id',    NEW.barangay_id
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_offender_after_delete$$
CREATE TRIGGER trg_offender_after_delete
AFTER DELETE ON offender
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values)
    VALUES ('offender', 'DELETE', OLD.id,
        JSON_OBJECT(
            'first_name',     OLD.first_name,
            'last_name',      OLD.last_name,
            'sex',            OLD.sex,
            'contact_number', OLD.contact_number,
            'barangay_id',    OLD.barangay_id
        )
    );
END$$

-- =============================================
-- abuse_type triggers
-- =============================================
DROP TRIGGER IF EXISTS trg_abuse_type_after_insert$$
CREATE TRIGGER trg_abuse_type_after_insert
AFTER INSERT ON abuse_type
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, new_values)
    VALUES ('abuse_type', 'INSERT', NEW.abuse_name,
        JSON_OBJECT(
            'abuse_description', NEW.abuse_description,
            'severity',          NEW.severity,
            'law_reference',     NEW.law_reference
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_abuse_type_after_update$$
CREATE TRIGGER trg_abuse_type_after_update
AFTER UPDATE ON abuse_type
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values, new_values)
    VALUES ('abuse_type', 'UPDATE', NEW.abuse_name,
        JSON_OBJECT(
            'abuse_description', OLD.abuse_description,
            'severity',          OLD.severity,
            'law_reference',     OLD.law_reference
        ),
        JSON_OBJECT(
            'abuse_description', NEW.abuse_description,
            'severity',          NEW.severity,
            'law_reference',     NEW.law_reference
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_abuse_type_after_delete$$
CREATE TRIGGER trg_abuse_type_after_delete
AFTER DELETE ON abuse_type
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values)
    VALUES ('abuse_type', 'DELETE', OLD.abuse_name,
        JSON_OBJECT(
            'abuse_description', OLD.abuse_description,
            'severity',          OLD.severity,
            'law_reference',     OLD.law_reference
        )
    );
END$$

-- =============================================
-- report triggers
-- =============================================
DROP TRIGGER IF EXISTS trg_report_before_insert$$
CREATE TRIGGER trg_report_before_insert
BEFORE INSERT ON report
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        SET NEW.id = fn_generate_report_id();
    END IF;
END$$

DROP TRIGGER IF EXISTS trg_report_after_insert$$
CREATE TRIGGER trg_report_after_insert
AFTER INSERT ON report
FOR EACH ROW
BEGIN
    -- Initial status history
    INSERT INTO report_status_history (report_id, old_status, new_status)
    VALUES (NEW.id, NULL, NEW.report_status);

    -- Audit log
    INSERT INTO audit_log (table_name, action_type, record_id, new_values)
    VALUES ('report', 'INSERT', NEW.id,
        JSON_OBJECT(
            'victim_id',    NEW.victim_id,
            'offender_id',  NEW.offender_id,
            'abuse_name',   NEW.abuse_name,
            'barangay_id',  NEW.barangay_id,
            'report_status',NEW.report_status
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_report_after_update$$
CREATE TRIGGER trg_report_after_update
AFTER UPDATE ON report
FOR EACH ROW
BEGIN
    -- Track status changes
    IF OLD.report_status <> NEW.report_status THEN
        INSERT INTO report_status_history (report_id, old_status, new_status)
        VALUES (NEW.id, OLD.report_status, NEW.report_status);
    END IF;

    -- Audit log
    INSERT INTO audit_log (table_name, action_type, record_id, old_values, new_values)
    VALUES ('report', 'UPDATE', NEW.id,
        JSON_OBJECT(
            'report_status',   OLD.report_status,
            'offender_id',     OLD.offender_id,
            'report_description', OLD.report_description
        ),
        JSON_OBJECT(
            'report_status',   NEW.report_status,
            'offender_id',     NEW.offender_id,
            'report_description', NEW.report_description
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_report_after_delete$$
CREATE TRIGGER trg_report_after_delete
AFTER DELETE ON report
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values)
    VALUES ('report', 'DELETE', OLD.id,
        JSON_OBJECT(
            'victim_id',    OLD.victim_id,
            'abuse_name',   OLD.abuse_name,
            'barangay_id',  OLD.barangay_id,
            'report_status',OLD.report_status
        )
    );
END$$

-- =============================================
-- responder triggers
-- =============================================
DROP TRIGGER IF EXISTS trg_responder_after_insert$$
CREATE TRIGGER trg_responder_after_insert
AFTER INSERT ON responder
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, new_values)
    VALUES ('responder', 'INSERT', NEW.id,
        JSON_OBJECT(
            'responder_name', NEW.responder_name,
            'agency',         NEW.agency,
            'contact_number', NEW.contact_number
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_responder_after_update$$
CREATE TRIGGER trg_responder_after_update
AFTER UPDATE ON responder
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values, new_values)
    VALUES ('responder', 'UPDATE', NEW.id,
        JSON_OBJECT(
            'responder_name', OLD.responder_name,
            'agency',         OLD.agency,
            'contact_number', OLD.contact_number
        ),
        JSON_OBJECT(
            'responder_name', NEW.responder_name,
            'agency',         NEW.agency,
            'contact_number', NEW.contact_number
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_responder_after_delete$$
CREATE TRIGGER trg_responder_after_delete
AFTER DELETE ON responder
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values)
    VALUES ('responder', 'DELETE', OLD.id,
        JSON_OBJECT(
            'responder_name', OLD.responder_name,
            'agency',         OLD.agency,
            'contact_number', OLD.contact_number
        )
    );
END$$

-- =============================================
-- dispatch triggers
-- =============================================
DROP TRIGGER IF EXISTS trg_dispatch_after_insert$$
CREATE TRIGGER trg_dispatch_after_insert
AFTER INSERT ON dispatch
FOR EACH ROW
BEGIN
    -- Auto-set report to Dispatched when first dispatch is created
    UPDATE report
    SET report_status = 'Dispatched'
    WHERE id = NEW.report_id
      AND report_status = 'Reported';

    INSERT INTO audit_log (table_name, action_type, record_id, new_values)
    VALUES ('dispatch', 'INSERT', NEW.id,
        JSON_OBJECT(
            'report_id',       NEW.report_id,
            'responder_id',    NEW.responder_id,
            'dispatch_status', NEW.dispatch_status
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_dispatch_after_update$$
CREATE TRIGGER trg_dispatch_after_update
AFTER UPDATE ON dispatch
FOR EACH ROW
BEGIN
    -- When dispatch is Completed, escalate report to Under Investigation if not already Resolved
    IF NEW.dispatch_status = 'Completed' THEN
        UPDATE report
        SET report_status = 'Under Investigation'
        WHERE id = NEW.report_id
          AND report_status NOT IN ('Resolved', 'Under Investigation');
    END IF;

    INSERT INTO audit_log (table_name, action_type, record_id, old_values, new_values)
    VALUES ('dispatch', 'UPDATE', NEW.id,
        JSON_OBJECT(
            'dispatch_status', OLD.dispatch_status,
            'remarks',         OLD.remarks
        ),
        JSON_OBJECT(
            'dispatch_status', NEW.dispatch_status,
            'remarks',         NEW.remarks
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_dispatch_after_delete$$
CREATE TRIGGER trg_dispatch_after_delete
AFTER DELETE ON dispatch
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values)
    VALUES ('dispatch', 'DELETE', OLD.id,
        JSON_OBJECT(
            'report_id',       OLD.report_id,
            'responder_id',    OLD.responder_id,
            'dispatch_status', OLD.dispatch_status
        )
    );
END$$

-- =============================================
-- resolved_report triggers
-- =============================================
DROP TRIGGER IF EXISTS trg_resolved_report_after_insert$$
CREATE TRIGGER trg_resolved_report_after_insert
AFTER INSERT ON resolved_report
FOR EACH ROW
BEGIN
    -- Automatically mark the parent report as Resolved
    UPDATE report
    SET report_status = 'Resolved'
    WHERE id = NEW.report_id;

    INSERT INTO audit_log (table_name, action_type, record_id, new_values)
    VALUES ('resolved_report', 'INSERT', NEW.report_id,
        JSON_OBJECT(
            'operator_id',        NEW.operator_id,
            'resolved_at',        NEW.resolved_at,
            'resolution_summary', NEW.resolution_summary
        )
    );
END$$

DROP TRIGGER IF EXISTS trg_resolved_report_after_update$$
CREATE TRIGGER trg_resolved_report_after_update
AFTER UPDATE ON resolved_report
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, old_values, new_values)
    VALUES ('resolved_report', 'UPDATE', NEW.report_id,
        JSON_OBJECT('resolution_summary', OLD.resolution_summary),
        JSON_OBJECT('resolution_summary', NEW.resolution_summary)
    );
END$$

DROP TRIGGER IF EXISTS trg_resolved_report_after_delete$$
CREATE TRIGGER trg_resolved_report_after_delete
AFTER DELETE ON resolved_report
FOR EACH ROW
BEGIN
    -- Revert report status to Under Investigation
    UPDATE report
    SET report_status = 'Under Investigation'
    WHERE id = OLD.report_id;

    INSERT INTO audit_log (table_name, action_type, record_id, old_values)
    VALUES ('resolved_report', 'DELETE', OLD.report_id,
        JSON_OBJECT(
            'operator_id',        OLD.operator_id,
            'resolved_at',        OLD.resolved_at,
            'resolution_summary', OLD.resolution_summary
        )
    );
END$$

DELIMITER ;